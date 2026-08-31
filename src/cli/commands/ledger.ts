import { Command } from 'commander';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, table, keyValue, spinner } from '../utils/output';
import * as fs from 'fs';
import * as path from 'path';

export const ledgerCommand = new Command('ledger')
  .description('Manage mock ledger state');

// Stats subcommand
ledgerCommand
  .command('stats')
  .description('Get ledger statistics')
  .action(async (_options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const response = await api.get<any>('/api/ledger/stats');

      if (jsonOutput) {
        printJson(response);
      } else {
        success('Ledger Statistics');
        console.log();
        keyValue({
          'Total Entries': response.data.totalEntries,
          'Current Ledger Sequence': response.data.currentLedgerSeq,
          'Entries by Type': JSON.stringify(response.data.entriesByType, null, 2)
        });
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// List subcommand
ledgerCommand
  .command('list')
  .description('List all ledger entries')
  .option('-t, --type <type>', 'Filter by entry type')
  .action(async (options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const url = options.type 
        ? `/api/ledger/entries/type/${options.type}`
        : '/api/ledger/entries';

      const response = await api.get<any>(url);

      if (jsonOutput) {
        printJson(response);
      } else {
        if (response.data.length === 0) {
          success('No ledger entries found');
        } else {
          success(`Found ${response.data.length} ledger entries`);
          console.log();
          table(response.data.map((entry: any) => ({
            Key: entry.key,
            Type: entry.type,
            Ledger: entry.lastModifiedLedgerSeq || 'N/A'
          })));
        }
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Clear subcommand
ledgerCommand
  .command('clear')
  .description('Clear all ledger entries')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);

      if (!options.yes) {
        error('Use --yes flag to confirm clearing all ledger entries');
        process.exit(1);
      }

      await api.delete('/api/ledger/clear');
      success('All ledger entries cleared');
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Seed subcommand
ledgerCommand
  .command('seed <file>')
  .description('Seed ledger state from a local JSON file')
  .option('-c, --clear', 'Clear existing entries before loading')
  .action(async (file, options, command) => {
    const stop = spinner('Loading ledger state...');
    
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      // Resolve file path
      const filePath = path.resolve(file);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        stop();
        error(`File not found: ${filePath}`);
        process.exit(1);
      }

      // Read and parse JSON file
      let snapshot;
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        snapshot = JSON.parse(fileContent);
      } catch (parseErr) {
        stop();
        error(`Failed to parse JSON file: ${parseErr instanceof Error ? parseErr.message : 'Invalid JSON'}`);
        process.exit(1);
      }

      // Import snapshot
      const requestBody = {
        snapshot,
        clearExisting: !!options.clear
      };

      const response = await api.post<any>('/api/snapshots/import', requestBody);
      
      stop();

      if (jsonOutput) {
        printJson(response);
      } else {
        success(`Ledger seeded from ${path.basename(filePath)}`);
        console.log();
        keyValue({
          'Entries Loaded': response.data.entriesLoaded,
          'Ledger Sequence': response.data.ledgerSequence,
          'Snapshot Created': response.data.createdAt
        });
      }
    } catch (err) {
      stop();
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });
