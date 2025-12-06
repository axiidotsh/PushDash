import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  static success(message: string): void {
    console.log(chalk.green(message));
  }

  static error(message: string): void {
    console.error(chalk.red(`Error: ${message}`));
  }

  static info(message: string): void {
    console.log(chalk.cyan(message));
  }

  static warn(message: string): void {
    console.log(chalk.yellow(message));
  }

  static log(message: string): void {
    console.log(message);
  }

  static spinner(text: string): Ora {
    return ora({
      text,
      color: 'cyan',
    }).start();
  }
}
