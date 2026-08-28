import { Command } from 'commander';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, table, keyValue } from '../utils/output';

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
