import { Command } from 'commander';
import { AuthManager } from '../lib/auth-manager.js';

export function createLoginCommand(): Command {
  const command = new Command('login');

  command.description('Authenticate with PushDash').action(async () => {
    const authManager = new AuthManager();
    await authManager.login();
  });

  return command;
}
