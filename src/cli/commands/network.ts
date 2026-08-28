import { Command } from 'commander';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, table } from '../utils/output';

export const networkCommand = new Command('network')
  .description('Manage network configurations');

// List subcommand
networkCommand
  .command('list')
  .description('List all available networks')
  .action(async (_options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const response = await api.get<any>('/api/networks');

      if (jsonOutput) {
        printJson(response);
      } else {
        success(`Found ${response.count} networks`);
        console.log();
        table(response.data.map((network: any) => ({
          ID: network.id,
          Name: network.name,
          Type: network.type,
          Default: network.isDefault ? '✓' : '',
          RPC: network.rpcUrl
        })));
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Set default subcommand
networkCommand
  .command('set-default <networkId>')
  .description('Set the default network')
  .action(async (networkId, _options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);

      await api.put(`/api/networks/default/${networkId}`);
      success(`Default network set to: ${networkId}`);
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });
