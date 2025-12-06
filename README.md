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
pushdash push /file.md --tag "work"
```

## Example

```bash
$ pushdash login

◐ Opening browser for authentication...

✓ Logged in as dev@pushdash.dev

$ pushdash push notes.md --tag "work"

✓ Uploaded notes.md

→ https://pushdash.dev/dashboard/files/x7k9m2


```

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

- **Frontend**: TanStack Start (React 19), Tailwind CSS v4, Radix UI
- **Backend**: Nitro, better-auth, Prisma
- **Database**: Prisma Postgres
- **Storage**: S3-compatible (Railway)
- **CLI**: Commander.js, Chalk, Axios

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
