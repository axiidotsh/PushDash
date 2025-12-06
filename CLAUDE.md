# PushDash

Developer-focused tool for pushing files from terminal to cloud dashboard. Upload files via CLI, manage them in a web UI with previews, search, and sharing.

## Project Type

Full-stack application with CLI tool for Prisma Hackathon.

## Architecture

**Monorepo structure:**

- `/src` - Web application (TanStack Start)
- `/cli` - CLI tool (Node.js)
- `/prisma` - Database schema and migrations

## Stack

### Frontend

- **Framework**: TanStack Start (React 19 SSR)
- **Router**: TanStack Router
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **State**: TanStack Query
- **Animations**: Framer Motion
- **Theme**: next-themes

### Backend

- **Runtime**: Nitro (latest)
- **Auth**: better-auth
- **Database ORM**: Prisma
- **Database**: Prisma Postgres (hosted)
- **Storage**: S3-compatible (Railway)

### CLI

- **Framework**: Commander.js
- **HTTP Client**: Axios
- **UI**: Chalk, Ora
- **Build**: tsup

### Dev Tools

- **Package Manager**: pnpm
- **TypeScript**: 5.7
- **Linting**: ESLint 9
- **Formatting**: Prettier
- **Testing**: Vitest
- **Git Hooks**: Husky

## Key Features

### MVP Scope

1. **CLI Upload**: Single file upload with metadata (tags, messages, visibility)
2. **Authentication**: Browser-based login flow
3. **Dashboard**: File list with filters, sort, search
4. **Previews**: Text files, images, PDFs
5. **Sharing**: Public/private shareable links
6. **Download**: Direct file downloads

### Post-MVP

- Bulk uploads
- Groups/teams
- Collections
- AI summaries & auto-tagging
- Real-time updates

## File Organization

```
src/
├── components/     # UI components
├── routes/        # TanStack Router routes
├── lib/           # Utilities
├── schemas/       # Zod schemas
├── hooks/         # React hooks
└── generated/     # Generated files

cli/
├── src/           # CLI source
└── dist/          # Built CLI

prisma/
├── schema.prisma  # Database schema
└── seed.ts        # Seed data
```

## Database Schema

**Core tables:**

- `users` - User accounts
- `files` - File metadata (filename, size, type, tags, message, visibility)
- `shared_links` - Public/private share links

**Post-MVP:**

- `groups` - Team/group management
- `collections` - Curated file sets

## Environment Variables

```
DATABASE_URL           # Prisma Postgres connection
BETTER_AUTH_SECRET     # Auth secret key
BETTER_AUTH_URL        # Auth callback URL
S3_ENDPOINT           # Storage endpoint
S3_ACCESS_KEY         # Storage credentials
S3_SECRET_KEY
S3_BUCKET             # Storage bucket name
```

## Scripts

### Web App

```bash
pnpm dev              # Dev server (port 3000)
pnpm build            # Production build
pnpm serve            # Preview build
pnpm test             # Run tests
```

### Database

```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:seed          # Seed database
```

### CLI

```bash
cd cli
pnpm build            # Build CLI
pnpm dev              # Watch mode
```

### Code Quality

```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix lint issues
pnpm format           # Format code
pnpm format:check     # Check formatting
```

## CLI Commands

```bash
pushdash login                              # Browser auth
pushdash push <path>                        # Upload file
pushdash push <path> --tag "work"          # With tag
pushdash push <path> --msg "description"   # With message
pushdash push <path> --public              # Public upload
pushdash logout                            # Clear credentials
```

## Data Flow

1. **Upload**: CLI → API → S3 Storage + Database
2. **List**: Dashboard → API → Database query
3. **Preview**: Dashboard → S3 signed URL
4. **Share**: Generate unique link → Database record
5. **Download**: Public/authenticated request → S3 redirect

## Authentication Flow

1. User runs `pushdash login`
2. CLI opens browser to auth page
3. User logs in via better-auth
4. Callback sends token to CLI
5. CLI stores credentials locally
6. Subsequent requests include auth token

## File Types Supported

- **Text**: `.txt`, `.md`, `.json`, code files
- **Images**: `.png`, `.jpg`, `.gif`, `.webp`
- **PDFs**: `.pdf`

## Deployment

- **Web**: Vercel or Railway
- **Database**: Prisma Postgres (hosted)
- **Storage**: Railway S3-compatible
- **CLI**: npm registry (post-MVP)

## Development Workflow

1. Start database: Ensure Prisma Postgres running
2. Generate Prisma: `pnpm db:generate`
3. Run migrations: `pnpm db:migrate`
4. Start dev: `pnpm dev`
5. Build CLI: `cd cli && pnpm build`
6. Test CLI: `node dist/index.js`
