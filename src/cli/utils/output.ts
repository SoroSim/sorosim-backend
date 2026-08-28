import chalk from 'chalk';

/**
 * Output formatting utilities
 */

/**
 * Print success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Print error message
 */
export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

/**
 * Print warning message
 */
export function warning(message: string): void {
  console.warn(chalk.yellow('⚠'), message);
}

/**
 * Print info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Print JSON output
 */
export function json(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Print table
 */
export function table(data: Array<Record<string, unknown>>): void {
  if (data.length === 0) {
    info('No data to display');
    return;
  }

  const keys = Object.keys(data[0]);
  const columnWidths: Record<string, number> = {};

  // Calculate column widths
  keys.forEach(key => {
    columnWidths[key] = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
  });

  // Print header
  const header = keys.map(key => 
    chalk.bold(key.padEnd(columnWidths[key]))
  ).join('  ');
  console.log(header);
  console.log(keys.map(key => '-'.repeat(columnWidths[key])).join('  '));

  // Print rows
  data.forEach(row => {
    const line = keys.map(key => 
      String(row[key] || '').padEnd(columnWidths[key])
    ).join('  ');
    console.log(line);
  });
}

/**
 * Print key-value pairs
 */
export function keyValue(data: Record<string, unknown>): void {
  const maxKeyLength = Math.max(...Object.keys(data).map(k => k.length));
  
  Object.entries(data).forEach(([key, value]) => {
    const formattedKey = chalk.cyan(key.padEnd(maxKeyLength));
    const formattedValue = typeof value === 'object' 
      ? JSON.stringify(value, null, 2) 
      : String(value);
    console.log(`${formattedKey}: ${formattedValue}`);
  });
}

/**
 * Print spinner (simple implementation)
 */
export function spinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i])} ${message}`);
    i = (i + 1) % frames.length;
  }, 80);

  return () => {
    clearInterval(interval);
    process.stdout.write('\r' + ' '.repeat(message.length + 3) + '\r');
  };
}
