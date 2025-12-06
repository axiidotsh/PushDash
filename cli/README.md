# PushDash CLI

CLI tool to push files directly from your terminal to PushDash cloud dashboard.

## Installation

```bash
npm install -g pushdash
```

Or use with npx:

```bash
npx pushdash <command>
```

## Usage

### Authentication

Before uploading files, you need to authenticate:

```bash
pushdash login
```

This will open your browser for authentication. Once authenticated, your credentials will be stored locally in `~/.pushdash/config.json`.

To log out:

```bash
pushdash logout
```

### Upload Files

Upload a file to PushDash:

```bash
pushdash push <file>
```

**Options:**

- `--tag <tag>` - Add a tag to the file (optional)
- `--msg <message>` - Add a message/description to the file (optional)
- `--public` - Make the file publicly accessible (default: private)

**Examples:**

```bash
# Simple upload
pushdash push myfile.pdf

# Upload with tag
pushdash push myfile.pdf --tag work

# Upload with tag and message
pushdash push myfile.pdf --tag work --msg "Q4 report"

# Upload as public file
pushdash push myfile.pdf --public

# Upload with all options
pushdash push myfile.pdf --tag work --msg "Q4 report" --public
```

### User Information

Check who you're currently logged in as:

```bash
pushdash whoami
```

### Help

Get help on available commands:

```bash
pushdash --help
```

Get help on a specific command:

```bash
pushdash push --help
```

## Configuration

Configuration is stored in `~/.pushdash/config.json`. This file contains your authentication token and user information.

## Supported File Types

- Text files (.txt, .md, .json, etc.)
- PDFs (.pdf)
- Images (.png, .jpg, .jpeg, .gif, .webp)
- Code files (.js, .ts, .py, etc.)

## Development

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Type Checking

```bash
pnpm typecheck
```

## License

MIT
