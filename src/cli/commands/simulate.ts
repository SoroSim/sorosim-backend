import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, keyValue, spinner, warning } from '../utils/output';

export const simulateCommand = new Command('simulate')
  .description('Simulate a Soroban contract invocation')
  .option('-c, --contract <id>', 'Contract ID (required unless --wasm is provided)')
  .option('-w, --wasm <path>', 'Path to WASM file to upload and use')
  .requiredOption('-m, --method <name>', 'Method name')
  .option('-a, --args <json>', 'Arguments as JSON array (e.g., \'[1, "hello", true]\')', '[]')
  .option('--arg <value...>', 'Individual arguments (auto-typed). Can be used multiple times')
  .option('-s, --source <account>', 'Source account public key')
  .option('-f, --fee <amount>', 'Transaction fee in stroops')
  .option('-n, --network <id>', 'Network ID to use')
  .option('--session <id>', 'Session ID to log to')
  .option('--show-abi', 'Show contract ABI after WASM upload')
  .action(async (options, command) => {
    let stop = spinner('Preparing simulation...');
    
    try {
      const parentCmd = command.parent as Command;
      const apiUrl = parentCmd.opts().url;
      const jsonOutput = parentCmd.opts().json;
      
      const api = createApiClient(apiUrl);

      // Validate: must have either contract ID or WASM path
      if (!options.contract && !options.wasm) {
        stop();
        error('Either --contract or --wasm must be provided');
        process.exit(1);
      }

      let contractId = options.contract;

      // If WASM file provided, upload it first
      if (options.wasm) {
        stop();
        stop = spinner('Uploading WASM file...');

        const wasmPath = path.resolve(options.wasm);
        
        if (!fs.existsSync(wasmPath)) {
          stop();
          error(`WASM file not found: ${wasmPath}`);
          process.exit(1);
        }

        // Read WASM file
        const wasmBuffer = fs.readFileSync(wasmPath);
        
        // Create form data
        const formData = new FormData();
        formData.append('wasm', wasmBuffer, {
          filename: path.basename(wasmPath),
          contentType: 'application/wasm'
        });

        try {
          // Upload WASM
          const uploadResponse = await api.post<any>(
            '/api/wasm/upload',
            formData,
            {
              headers: formData.getHeaders(),
              maxBodyLength: Infinity,
              maxContentLength: Infinity
            }
          );

          if (!uploadResponse.success) {
            stop();
            error(`WASM upload failed: ${uploadResponse.error || 'Unknown error'}`);
            process.exit(1);
          }

          stop();
          success(`WASM uploaded: ${uploadResponse.data.filename} (${uploadResponse.data.hash.substring(0, 8)}...)`);

          // Show ABI if requested
          if (options.showAbi && uploadResponse.data.abi) {
            console.log();
            console.log(chalk.cyan('Contract Functions:'));
            uploadResponse.data.abi.functions.forEach((fn: string) => {
              console.log(`  - ${fn}`);
            });
          }

          // Use the hash as contract ID if not provided
          if (!contractId) {
            contractId = uploadResponse.data.hash;
            console.log();
            warning(`Using WASM hash as contract ID: ${contractId.substring(0, 16)}...`);
          }
        } catch (uploadErr) {
          stop();
          error(`WASM upload failed: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}`);
          process.exit(1);
        }
      }

      // Parse arguments
      let args;
      try {
        if (options.arg && options.arg.length > 0) {
          // Use individual args with auto-typing
          args = options.arg.map((arg: string) => parseArgument(arg));
        } else {
          // Use JSON array
          args = JSON.parse(options.args);
        }
      } catch (parseErr) {
        stop();
        error('Invalid arguments: ' + (parseErr instanceof Error ? parseErr.message : 'Parse error'));
        process.exit(1);
      }

      stop();
      stop = spinner('Simulating contract invocation...');

      // Build request
      const requestBody = {
        contractId: contractId!,
        method: options.method,
        args,
        ...(options.source && { source: options.source }),
        ...(options.fee && { fee: options.fee })
      };

      // Build query params
      const queryParams = new URLSearchParams();
      if (options.network) queryParams.append('networkId', options.network);
      if (options.session) queryParams.append('sessionId', options.session);
      
      const queryString = queryParams.toString();
      const url = `/api/simulate${queryString ? '?' + queryString : ''}`;

      // Make request
      const response = await api.post<any>(url, requestBody);
      
      stop();

      if (jsonOutput) {
        printJson(response);
      } else {
        if (response.success) {
          success('Simulation completed successfully');
          console.log();
          
          keyValue({
            'Request ID': response.requestId,
            'Timestamp': response.timestamp,
            'Duration': `${response.duration}ms`,
            'Success': response.data.success,
            'Latest Ledger': response.data.latestLedger,
            'Min Resource Fee': response.data.minResourceFee || 'N/A',
            'Events': response.data.events?.length || 0,
            'State Changes': response.data.stateDiff?.summary?.totalChanges || 0
          });

          if (response.data.error) {
            console.log();
            error(`Error: ${response.data.error}`);
          }
        } else {
          error('Simulation failed');
          if (response.error) {
            console.log(chalk.gray(response.error));
          }
        }
      }
    } catch (err) {
      stop();
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

/**
 * Parse command line argument with auto-type detection
 */
function parseArgument(arg: string): unknown {
  // Try to parse as JSON first (handles objects, arrays, etc.)
  try {
    return JSON.parse(arg);
  } catch {
    // Not valid JSON, continue with other parsing
  }

  // Check for boolean
  if (arg === 'true') return true;
  if (arg === 'false') return false;

  // Check for null
  if (arg === 'null') return null;

  // Check for number
  if (/^-?\d+(\.\d+)?$/.test(arg)) {
    const num = Number(arg);
    if (!isNaN(num)) return num;
  }

  // Default to string
  return arg;
}
