import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createLoginCommand } from './commands/login.js';
import { createLogoutCommand } from './commands/logout.js';
import { createPushCommand } from './commands/push.js';
import { createWhoamiCommand } from './commands/whoami.js';

// Get version from package.json
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

program.addCommand(createLoginCommand());
program.addCommand(createLogoutCommand());
program.addCommand(createPushCommand());
program.addCommand(createWhoamiCommand());

program.parse(process.argv);
