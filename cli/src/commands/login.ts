import { Command } from 'commander';
import { AuthManager } from '../lib/auth-manager.js';

export function createLoginCommand(): Command {
  const command = new Command('login');

  command.description('Authenticate with PushDash').action(async () => {
    try {
      const authManager = new AuthManager();
      await authManager.login();
    } catch {
      // Error already logged by AuthManager, just exit
      process.exit(1);
    }
  });

  return command;
}
