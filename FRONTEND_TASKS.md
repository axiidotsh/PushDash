# PushDash Frontend Task Checklist

## Phase 1: Authentication UI

### Types & Data

- [ ] Create `User` type
- [ ] Create `Session` type
- [ ] Add mock user data generator

### React Query Hooks

- [ ] Create `useSession` hook
- [ ] Create `useSignIn` mutation hook
- [ ] Create `useSignUp` mutation hook
- [ ] Create `useSignOut` mutation hook

### Components

- [ ] Create sign-up form component
- [ ] Create sign-in form component
- [ ] Create sign-out button component
- [ ] Create protected route wrapper component
- [ ] Create auth layout component

### Routes

- [ ] Create sign-up page route
- [ ] Create sign-in page route
- [ ] Create auth route layout

---

## Phase 2: Dashboard Core Layout

### Types & Data

- [ ] Create `File` type
- [ ] Create `FileType` enum
- [ ] Create `Visibility` enum
- [ ] Add mock file data generator

### React Query Hooks

- [ ] Create `useFiles` hook

### Components

- [ ] Create app shell layout
- [ ] Create user menu dropdown
- [ ] Create file list component
- [ ] Create file card component
- [ ] Create file row component
- [ ] Create file list skeleton
- [ ] Create empty state component

### Routes

- [ ] Create dashboard layout
- [ ] Create dashboard index page

---

## Phase 3: Filtering, Sorting & Search

### Types & Data

- [ ] Create `FileFilters` type
- [ ] Create `FileSortOption` type

### React Query Hooks

- [ ] Update `useFiles` hook to accept filter, sort, and search params

### Components

- [ ] Create filter bar component
- [ ] Create date filter component
- [ ] Create file type filter component
- [ ] Create tag filter component
- [ ] Create sort controls component
- [ ] Create search input component

### State Management

- [ ] Create filter state hook

---

## Phase 4: File Previews

### Types & Data

- [ ] Add `content` field to `File` type for text file content
- [ ] Update mock data to include file content for text files

### React Query Hooks

- [ ] Create `useFile` hook

### Components

- [ ] Create file preview modal
- [ ] Create text preview component
- [ ] Create markdown preview component
- [ ] Create JSON preview component
- [ ] Create code preview component
- [ ] Create image preview component
- [ ] Create PDF preview component
- [ ] Create preview loading skeleton
- [ ] Create preview error state

### Routes

- [ ] Create file detail page

---

## Phase 5: Sharing & Download UI

### Types & Data

- [ ] Create `ShareLink` type
- [ ] Add mock share link data generator

### React Query Hooks

- [ ] Create `useCreateShareLink` mutation hook
- [ ] Create `useShareLink` hook
- [ ] Create `useDownloadFile` hook

### Components

- [ ] Create download button component
- [ ] Create share button component
- [ ] Create share modal component
- [ ] Create copy link button component

### Routes

- [ ] Create public share page

---

## Phase 6: Good-to-Have Features

### Real-time Updates

- [ ] Create real-time connection hook
- [ ] Create file upload event handler
- [ ] Add new file notification toast
- [ ] Create mock real-time event simulator

---

## Phase 7: Post-MVP Features

### Bulk Upload Progress UI

- [ ] Create bulk upload progress component
- [ ] Create upload queue state hook

### Groups

- [ ] Create `Group` type
- [ ] Create `GroupMember` type
- [ ] Create `useGroups` hook
- [ ] Create `useCreateGroup` mutation hook
- [ ] Create `useGroupMembers` hook
- [ ] Create `useInviteToGroup` mutation hook
- [ ] Create groups list component
- [ ] Create group card component
- [ ] Create create group modal
- [ ] Create group invitation modal
- [ ] Create member list component
- [ ] Create groups page route
- [ ] Create group detail page route

### AI Features

- [ ] Add `summary` field to `File` type
- [ ] Add `suggestedTags` field to `File` type
- [ ] Create AI summary display component
- [ ] Create auto-tag suggestions component

### Collections

- [ ] Create `Collection` type
- [ ] Create `useCollections` hook
- [ ] Create `useCreateCollection` mutation hook
- [ ] Create `useAddToCollection` mutation hook
- [ ] Create collections list component
- [ ] Create collection card component
- [ ] Create create collection modal
- [ ] Create add to collection dropdown
- [ ] Create collections page route
- [ ] Create collection detail page route
