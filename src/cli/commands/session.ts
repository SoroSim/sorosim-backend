import { Command } from 'commander';
import { createApiClient } from '../utils/api';
import { success, error, json as printJson, table, keyValue } from '../utils/output';

export const sessionCommand = new Command('session')
  .description('Manage simulation sessions');

// List subcommand
sessionCommand
  .command('list')
  .description('List all sessions')
  .option('-a, --active', 'Show only active sessions')
  .action(async (options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const url = options.active ? '/api/sessions/active' : '/api/sessions';
      const response = await api.get<any>(url);

      if (jsonOutput) {
        printJson(response);
      } else {
        if (response.data.length === 0) {
          success('No sessions found');
        } else {
          success(`Found ${response.data.length} sessions`);
          console.log();
          table(response.data.map((session: any) => ({
            ID: session.sessionId.substring(0, 8) + '...',
            Name: session.metadata?.name || 'N/A',
            Status: session.status,
            Invocations: session.invocationCount,
            Created: new Date(session.createdAt).toLocaleString()
          })));
        }
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Create subcommand
sessionCommand
  .command('create')
  .description('Create a new session')
  .option('-n, --name <name>', 'Session name')
  .option('-d, --description <desc>', 'Session description')
  .action(async (options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const requestBody: any = {};
      if (options.name) requestBody.name = options.name;
      if (options.description) requestBody.description = options.description;

      const response = await api.post<any>('/api/sessions', requestBody);

      if (jsonOutput) {
        printJson(response);
      } else {
        success('Session created successfully');
        console.log();
        keyValue({
          'Session ID': response.data.sessionId,
          'Name': response.data.metadata?.name || 'N/A',
          'Status': response.data.status,
          'Created': response.data.createdAt
        });
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });

// Info subcommand
sessionCommand
  .command('info <sessionId>')
  .description('Get session details')
  .option('-h, --history', 'Include invocation history')
  .action(async (sessionId, options, command) => {
    try {
      const rootCmd = command.parent?.parent as Command;
      const api = createApiClient(rootCmd.opts().url);
      const jsonOutput = rootCmd.opts().json;

      const url = `/api/sessions/${sessionId}${options.history ? '?includeHistory=true' : ''}`;
      const response = await api.get<any>(url);

      if (jsonOutput) {
        printJson(response);
      } else {
        success('Session Details');
        console.log();
        keyValue({
          'Session ID': response.data.sessionId,
          'Name': response.data.metadata?.name || 'N/A',
          'Status': response.data.status,
          'Invocations': response.data.invocationCount,
          'Created': response.data.createdAt,
          'Last Activity': response.data.lastActivityAt
        });

        if (options.history && response.data.invocations) {
          console.log();
          success(`Invocation History (${response.data.invocations.length})`);
          console.log();
          table(response.data.invocations.slice(0, 10).map((inv: any) => ({
            Time: new Date(inv.timestamp).toLocaleTimeString(),
            Contract: inv.contractId.substring(0, 12) + '...',
            Method: inv.method,
            Success: inv.result.success ? '✓' : '✗',
            Duration: `${inv.duration}ms`
          })));
        }
      }
    } catch (err) {
      error(err instanceof Error ? err.message : 'Unknown error');
      process.exit(1);
    }
  });
