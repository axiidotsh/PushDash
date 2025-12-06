# PushDash Task Checklist

## Phase 1: Project Foundation

### Database Schema

- [ ] Design database schema for users table
- [ ] Design database schema for files table with metadata fields
- [ ] Design database schema for shared links table
- [ ] Add file metadata fields: filename, size, timestamp, tag, message, file type
- [ ] Add public/private visibility field to files table
- [ ] Create database migrations
- [ ] Seed database with test data

### Authentication

- [ ] Set up user registration flow
- [ ] Set up user login flow
- [ ] Set up user logout flow
- [ ] Implement session management
- [ ] Create protected route middleware
- [ ] Add authentication state to frontend

### Cloud Storage

- [ ] Configure S3-compatible storage bucket
- [ ] Set up storage credentials and environment variables
- [ ] Create storage utility for file operations
- [ ] Implement secure file URL generation

---

## Phase 2: File Storage Backend

### File Upload API

- [ ] Create file upload endpoint
- [ ] Implement file size validation
- [ ] Implement file type validation
- [ ] Handle file metadata extraction
- [ ] Store file content to cloud storage
- [ ] Save file record to database
- [ ] Return file URL after successful upload

### File Type Detection

- [ ] Detect text file types (txt, md, json, code files)
- [ ] Detect image file types (png, jpg, gif, webp)
- [ ] Detect PDF file type
- [ ] Store detected file type in database

### Visibility Logic

- [ ] Implement public file access
- [ ] Implement private file access (owner only)
- [ ] Implement shared file access (via link)
- [ ] Create authorization checks for file retrieval

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
- [ ] Apply filters to file list query

### Sorting

- [ ] Add sort by time option
- [ ] Add sort by name option
- [ ] Add sort by size option
- [ ] Add sort by date added option
- [ ] Implement sort direction toggle (ascending/descending)
- [ ] Apply sorting to file list query

### Search

- [ ] Add search input component
- [ ] Implement search by filename
- [ ] Apply search filter to file list query
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

- [ ] Create download endpoint
- [ ] Add download button to file view
- [ ] Implement secure file download
- [ ] Set proper content-disposition headers

---

## Phase 5: Sharing System

### Shareable Links

- [ ] Create share link generation endpoint
- [ ] Generate unique shareable URL for files
- [ ] Store share link records in database
- [ ] Create public file view page

### Access Control

- [ ] Implement public link access (anyone with link)
- [ ] Implement private link access (requires authentication)
- [ ] Validate share link on file access
- [ ] Handle expired or invalid share links

### Share UI

- [ ] Add share button to file view
- [ ] Create share modal/dialog
- [ ] Add visibility toggle (public/private) in share UI
- [ ] Display generated shareable link
- [ ] Add copy link to clipboard functionality

---

## Phase 6: CLI Tool

### CLI Setup

- [ ] Initialize CLI project structure
- [ ] Set up CLI command framework
- [ ] Configure CLI build and distribution
- [ ] Create CLI help documentation

### Authentication

- [ ] Implement `login` command
- [ ] Open browser for authentication
- [ ] Handle authentication callback
- [ ] Store authentication credentials locally
- [ ] Implement `logout` command
- [ ] Clear stored credentials on logout

### File Upload Command

- [ ] Implement `push` command for single file upload
- [ ] Validate file path argument
- [ ] Read file content from local filesystem
- [ ] Upload file to server API

### Metadata Flags

- [ ] Add `--tag` flag for file tagging
- [ ] Add `--msg` flag for file message/description
- [ ] Add `--public` flag for public visibility
- [ ] Parse and validate flag values

### Output

- [ ] Display upload progress indicator
- [ ] Print file URL after successful upload
- [ ] Display error messages on failure
- [ ] Show success confirmation message

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
