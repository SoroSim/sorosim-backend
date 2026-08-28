#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { simulateCommand } from './commands/simulate';
import { ledgerCommand } from './commands/ledger';
import { sessionCommand } from './commands/session';
import { networkCommand } from './commands/network';
import { snapshotCommand } from './commands/snapshot';

const program = new Command();

// CLI metadata
program
  .name('sorosim')
  .description('SoroSim CLI - Soroban Contract Simulation & Dry-Run Sandbox')
  .version('1.0.0');

// Global options
program
  .option('-u, --url <url>', 'Backend API URL', process.env.SOROSIM_API_URL || 'http://localhost:3000')
  .option('--json', 'Output in JSON format')
  .option('-v, --verbose', 'Verbose output');

// Commands
program.addCommand(simulateCommand);
program.addCommand(ledgerCommand);
program.addCommand(sessionCommand);
program.addCommand(networkCommand);
program.addCommand(snapshotCommand);

// Help text styling
program.configureHelp({
  commandUsage: (cmd) => chalk.cyan(cmd.name() + ' ' + cmd.usage()),
  commandDescription: (cmd) => chalk.white(cmd.description()),
  optionDescription: (option) => chalk.gray(option.description),
  subcommandDescription: (cmd) => chalk.gray(cmd.description())
});

// Error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (error) {
  if (error instanceof Error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

// Show help if no command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
