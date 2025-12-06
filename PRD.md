Product Requirements Document for PushDash

## **1. Overview**

---

PushDash is a developer-focused tool that lets users files **directly from their terminal** to a hosted cloud dashboard. The uploaded files appear instantly in a **beautiful, searchable, organized UI**, where they can be:

- previewed
- grouped (Post MVP)
- tagged
- shared with others
- downloaded back anytime

Supported file types in MVP: text files, PDFs, images

The product creates a repository of files, notes, and artifacts - easy to push from anywhere and easy to explore visually online.

---

## **2. Users**

### **Developers**

- Want quick uploads of files/configs without going through the trouble of setting up git.
- Want to access their files quickly across machines.
- Want to share files/configs with friends quickly.
- Need lightweight collaboration without full GitHub repos.

---

## **3. Core Value Proposition**

- **Zero-friction uploads from terminal**
  Developers can push files instantly with a simple CLI, no repo or tooling setup needed.
- **Instant accessible dashboard**
  Uploads appear online immediately, with readable previews.
- **Sharing & collaboration**
  Share individual files via unique links or whole groups/collections (Post MVP)
- **Future-ready [Post MVP]**
  AI enrichment, automated summaries, smart organization, and visualizations can be layered in later. All this will come post MVP and will not be core focus for the project as of now.

---

## **4. Core Features (MVP)**

### **4.1 Terminal Upload (CLI)**

- Upload a single file.
- Upload multiple files (bulk) [Post MVP]
- Include metadata: tag, message, optional visibility flag.
- Authentication via browser login or Token based (Post MVP)
- Generate and return link in the terminal after upload.

### **4.2 File Storage**

- Store each file with metadata.
- Metadata: filename, size, timestamp, tag, message, file type.
- Public/private flag (private requires login).
- Basic file type detection.

### **4.3 Web Dashboard (/dashboard page)**

- Clean UI showing list of files for the user.
- Filters: date, file type, tags.
- Sort by time, name, size, date added
- Search by filename.
- File previews:
  - text preview for `.txt`, `.md`, `.json`, code blocks, etc
  - image preview for common image types
  - pdf preview

### **4.4 Sharing**

- Shareable link for files (public view or gated view).
- Optional expiration on shared links (Not important)

### **4.5 Download**

- Any file can be downloaded.

### **4.6 Groups [ Post MVP]**

- Users can create groups (teams / friends).
- Inviting members via link.

---

## **5. Extended Features (Post-MVP / Stretch)**

### **A. AI Enhancements**

- AI-generated short summary of file contents.
- Auto-tagging for file categorization.

### **B. Collections**

- Users can manually create collections of files.
- Share collections as curated sets

---

## 6. Good to Haves

- Real-time updates on the dashboard. The files/uploads will instantly come up on any open dashboard when the user uploads it.

---

## **7. Non-Goals**

- No Git integration.
- No file editing in browser.
- No complex permissions beyond user or public or group.
- No heavy processing for binaries (videos, large binaries).
- No support for huge files - focus in on text files, PDFs and at most images

---

## **8 User Flows**

### **8.1 Terminal → Upload Flow**

1. User installs CLI
2. User authenticates with browser (via link in the CLI)
   1. Command like `$ pushdash login`
3. User runs `pushdash push <path> --tag="..." --msg="..."`
   1. tag and msg are optional
   2. Another optional flag called `--public` or something similar which will automatically make the file public. Default is private uploads.
   3. Commands are not fixed as of now. There is a lot of room for different types of flags.
4. CLI uploads file(s).
5. Terminal prints URL(s).
6. Files appear on the dashboard

### **8.2 Dashboard Browsing**

1. User logs in.
2. Sees all their files.
3. User can click a file to view them.
4. User can preview these files easily in the dashboard itself.
5. User can download or share from the dashboard.

### **8.3 Sharing**

1. From file view → "Share link".
2. User selects public/private.
3. User can pick individual users to share with for private.
4. Shareable URL is generated.

### **8.4 Group Collaboration [ Post MVP ]**

1. Create group → invite teammate.
2. Group owns collections

---

## **9. Project Structure (High-level)**

### **File Storage**

- Buckets for file content (Railway probably, s3 compatible).

### **Database**

- Prisma Postgres (hosted)
- Stores: users, files, links, groups (post MVP)

### **Frontend + Backend**

- Deployed on Vercel or Railway

---
