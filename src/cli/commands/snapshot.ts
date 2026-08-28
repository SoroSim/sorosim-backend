import { Command } from 'commander';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, table } from '../utils/output';
import * as fs from 'fs';
import * as path from 'path';

export const snapshotCommand = new Command('snapshot')
  .description('Manage ledger snapshots');

// List subcommand
snapshotCommand
  .command('list')
  .description('List all snapshots')
  .action(async (_options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const response = await api.get<any>('/api/snapshots');

      if (jsonOutput) {
        printJson(response);
      } else {
        if (response.data.length === 0) {
          success('No snapshots found');
        } else {
          success(`Found ${response.data.length} snapshots`);
          console.log();
          table(response.data.map((snapshot: any) => ({
            Filename: snapshot.filename,
            Size: `${(snapshot.size / 1024).toFixed(2)} KB`,
            Modified: new Date(snapshot.modified).toLocaleString()
          })));
        }
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Save subcommand
snapshotCommand
  .command('save <filename>')
  .description('Save current ledger state to snapshot')
  .action(async (filename, _options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);

      const requestBody = {
        filename: filename.endsWith('.json') ? filename : `${filename}.json`
      };

      await api.post<any>('/api/snapshots/save', requestBody);
      success(`Snapshot saved: ${requestBody.filename}`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Load subcommand
snapshotCommand
  .command('load <filename>')
  .description('Load ledger state from snapshot')
  .option('-c, --clear', 'Clear existing entries before loading')
  .action(async (filename, options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);

      const requestBody = {
        filename: filename.endsWith('.json') ? filename : `${filename}.json`,
        clearExisting: !!options.clear
      };

      const response = await api.post<any>('/api/snapshots/load', requestBody);
      success(`Snapshot loaded: ${response.data.entriesLoaded} entries`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Export subcommand
snapshotCommand
  .command('export [outputFile]')
  .description('Export current ledger state')
  .action(async (outputFile, _options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);

      const response = await api.post<any>('/api/snapshots/create');
      const snapshot = response.data;

      if (outputFile) {
        const filePath = path.resolve(outputFile);
        fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
        success(`Ledger state exported to: ${filePath}`);
      } else {
        printJson(snapshot);
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });
