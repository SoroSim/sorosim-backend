import { Command } from 'commander';
import chalk from 'chalk';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, keyValue, spinner } from '../utils/output';

export const simulateCommand = new Command('simulate')
  .description('Simulate a Soroban contract invocation')
  .requiredOption('-c, --contract <id>', 'Contract ID')
  .requiredOption('-m, --method <name>', 'Method name')
  .option('-a, --args <json>', 'Arguments as JSON array', '[]')
  .option('-s, --source <account>', 'Source account public key')
  .option('-f, --fee <amount>', 'Transaction fee in stroops')
  .option('-n, --network <id>', 'Network ID to use')
  .option('--session <id>', 'Session ID to log to')
  .action(async (options, command) => {
    const stop = spinner('Simulating contract invocation...');
    
    try {
      const parentCmd = command.parent as Command;
      const apiUrl = parentCmd.opts().url;
      const jsonOutput = parentCmd.opts().json;
      
      const api = createApiClient(apiUrl);

      // Parse arguments
      let args;
      try {
        args = JSON.parse(options.args);
      } catch {
        stop();
        error('Invalid arguments JSON');
        process.exit(1);
      }

      // Build request
      const requestBody = {
        contractId: options.contract,
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
