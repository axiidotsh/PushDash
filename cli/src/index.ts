import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createLoginCommand } from './commands/login.js';
import { createLogoutCommand } from './commands/logout.js';
import { createPushCommand } from './commands/push.js';
import { createWhoamiCommand } from './commands/whoami.js';
import { createListCommand } from './commands/list.js';
import { createDeleteCommand } from './commands/delete.js';
import { createOpenCommand } from './commands/open.js';
import { createInfoCommand } from './commands/info.js';
import { createShareCommand } from './commands/share.js';

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('pushdash')
  .description('CLI tool to push files to PushDash cloud dashboard')
  .version(packageJson.version);

// Register commands
program.addCommand(createLoginCommand());
program.addCommand(createLogoutCommand());
program.addCommand(createPushCommand());
program.addCommand(createListCommand());
program.addCommand(createInfoCommand());
program.addCommand(createOpenCommand());
program.addCommand(createShareCommand());
program.addCommand(createDeleteCommand());
program.addCommand(createWhoamiCommand());

// Parse arguments
program.parse(process.argv);
