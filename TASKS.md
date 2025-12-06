# PushDash Task Checklist

## Phase 1: Project Foundation

### Database Schema

- [x] Design database schema for users table
- [x] Design database schema for files table with metadata fields
- [x] Design database schema for shared links table
- [x] Add file metadata fields: filename, size, timestamp, tag, message, file type
- [x] Add public/private visibility field to files table
- [ ] Create database migrations
- [ ] Seed database with test data

### Authentication

- [x] Set up user registration flow (Better Auth)
- [x] Set up user login flow (Better Auth + GitHub OAuth)
- [x] Set up user logout flow (Better Auth)
- [x] Implement session management (Better Auth)
- [x] Create protected route middleware (api-helpers.ts)
- [ ] Add authentication state to frontend

### Cloud Storage

- [ ] Configure S3-compatible storage bucket (need env vars)
- [x] Set up storage credentials and environment variables (env.ts schema)
- [x] Create storage utility for file operations (storage.ts)
- [x] Implement secure file URL generation (signed URLs)

---

## Phase 2: File Storage Backend

### File Upload API

- [x] Create file upload endpoint (`/api/files/upload`)
- [x] Implement file size validation (25MB limit)
- [x] Implement file type validation (file-utils.ts)
- [x] Handle file metadata extraction
- [x] Store file content to cloud storage
- [x] Save file record to database
- [x] Return file URL after successful upload

### File Type Detection

- [x] Detect text file types (txt, md, json, code files)
- [x] Detect image file types (png, jpg, gif, webp)
- [x] Detect PDF file type
- [x] Store detected file type in database (mimeType field)

### Visibility Logic

- [x] Implement public file access
- [x] Implement private file access (owner only)
- [x] Implement shared file access (via link)
- [x] Create authorization checks for file retrieval

---

## Phase 3: Web Dashboard - Core UI

### Dashboard Layout

- [ ] Create dashboard page route
- [ ] Design dashboard layout structure
- [ ] Display user's file list
- [ ] Show file metadata in list view (name, size, date, type, tag)
- [ ] Add empty state for no files
- [ ] Implement loading state for file list

### Filtering

- [ ] Add date filter component
- [ ] Add file type filter component
- [ ] Add tag filter component
- [ ] Implement filter state management
- [x] Apply filters to file list query (API supports filtering)

### Sorting

- [ ] Add sort by time option
- [ ] Add sort by name option
- [ ] Add sort by size option
- [ ] Add sort by date added option
- [ ] Implement sort direction toggle (ascending/descending)
- [x] Apply sorting to file list query (API supports sorting)

### Search

- [ ] Add search input component
- [ ] Implement search by filename
- [x] Apply search filter to file list query (API supports search)
- [ ] Add search results empty state

---

## Phase 4: File Previews & Actions

### Text Preview

- [ ] Create text file preview component
- [ ] Support .txt file preview
- [ ] Support .md file preview with formatting
- [ ] Support .json file preview with syntax highlighting
- [ ] Support code file preview with syntax highlighting

### Image Preview

- [ ] Create image preview component
- [ ] Support PNG image preview
- [ ] Support JPG/JPEG image preview
- [ ] Support GIF image preview
- [ ] Support WebP image preview
- [ ] Add image zoom/fullscreen capability

### PDF Preview

- [ ] Create PDF preview component
- [ ] Render PDF pages in browser
- [ ] Add PDF page navigation

### Download

- [x] Create download endpoint (`/api/files/$id/download`)
- [ ] Add download button to file view
- [x] Implement secure file download
- [x] Set proper content-disposition headers

---

## Phase 5: Sharing System

### Shareable Links

- [x] Create share link generation endpoint (`/api/files/$id/share`)
- [x] Generate unique shareable URL for files
- [x] Store share link records in database
- [ ] Create public file view page

### Access Control

- [x] Implement public link access (anyone with link)
- [x] Implement private link access (requires authentication)
- [x] Validate share link on file access
- [x] Handle expired or invalid share links

### Share UI

- [ ] Add share button to file view
- [ ] Create share modal/dialog
- [ ] Add visibility toggle (public/private) in share UI
- [ ] Display generated shareable link
- [ ] Add copy link to clipboard functionality

---

## Phase 6: CLI Tool

### CLI Setup

- [x] Initialize CLI project structure
- [x] Set up CLI command framework (Commander)
- [ ] Configure CLI build and distribution
- [x] Create CLI help documentation (basic)

### Authentication

- [x] Implement `login` command
- [x] Open browser for authentication
- [x] Handle authentication callback (API: `/api/auth/cli/*`)
- [x] Store authentication credentials locally (config-manager.ts)
- [x] Implement `logout` command
- [x] Clear stored credentials on logout

### File Upload Command

- [x] Implement `push` command for single file upload
- [x] Validate file path argument
- [x] Read file content from local filesystem
- [x] Upload file to server API

### Metadata Flags

- [x] Add `--tag` flag for file tagging
- [x] Add `--msg` flag for file message/description
- [x] Add `--public` flag for public visibility
- [x] Parse and validate flag values

### Output

- [ ] Display upload progress indicator
- [x] Print file URL after successful upload
- [x] Display error messages on failure
- [x] Show success confirmation message

---

## Phase 7: Good-to-Have Features

### Real-time Updates

- [ ] Set up real-time connection infrastructure
- [ ] Subscribe to file upload events on dashboard
- [ ] Update file list automatically on new upload
- [ ] Show notification for new file uploads

---

## Phase 8: Post-MVP Features

### Bulk File Uploads

- [ ] Support multiple file paths in CLI push command
- [ ] Handle batch file uploads in API
- [ ] Display progress for multiple files
- [ ] Show summary of bulk upload results

### Token-based CLI Authentication

- [ ] Generate API tokens for users
- [ ] Store tokens securely in CLI
- [ ] Authenticate CLI requests with token
- [ ] Add token management UI in dashboard

### Groups

- [ ] Design database schema for groups
- [ ] Create group creation endpoint
- [ ] Create group membership table
- [ ] Implement group creation UI
- [ ] Display user's groups in dashboard

### Group Invitations

- [ ] Generate group invitation links
- [ ] Create invitation acceptance flow
- [ ] Add member management to groups
- [ ] Share files with group members

### AI-Generated Summaries

- [ ] Integrate AI service for text analysis
- [ ] Generate summary for text files on upload
- [ ] Store summaries in database
- [ ] Display summaries in file preview

### AI Auto-Tagging

- [ ] Analyze file content for tag suggestions
- [ ] Generate relevant tags automatically
- [ ] Allow users to accept/reject suggested tags
- [ ] Apply auto-tags to uploaded files

### Collections

- [ ] Design database schema for collections
- [ ] Create collection management endpoints
- [ ] Add files to collections
- [ ] Display collections in dashboard
- [ ] Share collections via link
