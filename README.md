# PushDash

**Push files from terminal to cloud**

Upload files via CLI, manage them in a beautiful dashboard. Preview, search, and share — all from one command.

## Quick Start

Get up and running in under a minute.

### 1. Install the CLI globally

```bash
npm install -g pushdash
```

### 2. Authenticate with your account

```bash
pushdash login
```

### 3. Push your first file

```bash
pushdash push ./file.pdf --tag "work"
```

## Example

```bash
$ pushdash login

◐ Opening browser for authentication...

✓ Logged in as dev@example.com

$ pushdash push ./report.pdf --tag "work"

✓ Uploaded report.pdf (2.4 MB)

→ https://pushdash.app/f/abc123

$
```

## Why PushDash?

A developer-first approach to file management. No bloated apps, no complicated workflows.

### One Command Upload

Push files instantly with a single CLI command. No browser needed.

### Beautiful Dashboard

Preview, search, and organize your files in a clean web interface.

### Instant Sharing

Generate shareable links with `--public` flag. Share in seconds.

### Secure by Default

Files are private unless explicitly shared. You control access.

## CLI Commands

```bash
pushdash login                              # Browser auth
pushdash push <path>                        # Upload file
pushdash push <path> --tag "work"          # With tag
pushdash push <path> --msg "description"   # With message
pushdash push <path> --public              # Public upload
pushdash list                               # List your files
pushdash open <file-id>                    # Open file in dashboard
pushdash share <file-id>                   # Generate share link
pushdash delete <file-id>                  # Delete file
pushdash info <file-id>                    # Show file details
pushdash whoami                            # Show current user
pushdash logout                            # Clear credentials
```

## Tech Stack

- **Frontend**: TanStack Start (React 19 SSR), Tailwind CSS v4, Radix UI
- **Backend**: Nitro, better-auth, Prisma
- **Database**: Prisma Postgres
- **Storage**: S3-compatible (Railway)
- **CLI**: Commander.js, Axios

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build CLI
cd cli && pnpm build

# Database commands
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
```
