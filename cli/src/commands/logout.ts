import { Command } from 'commander';
import { AuthManager } from '../lib/auth-manager.js';

export function createLogoutCommand(): Command {
  const command = new Command('logout');

  command.description('Log out from PushDash').action(async () => {
    const authManager = new AuthManager();
    await authManager.logout();
  });

  return command;
}
