# Item Types Reference

> Auto-generated research documentation for DevStash item types.

---

## Overview

DevStash has **7 system item types**, each representing a distinct kind of developer knowledge. All system types have `isSystem: true` and `userId: null` in the database. Users will eventually be able to create custom types (Pro feature).

Items are classified into three content models based on how their data is stored:

| Content Model | `contentType` | Primary Field | Types |
|---|---|---|---|
| **Text** | `"text"` | `content` | Snippet, Prompt, Command, Note |
| **URL** | `"url"` | `url` | Link |
| **File** | `"file"` | `fileUrl`, `fileName`, `fileSize` | File, Image |

---

## System Item Types

### 1. Snippet

| Property | Value |
|---|---|
| **Icon** | `Code` (Lucide) |
| **Color** | `#3b82f6` (Blue) |
| **Content Model** | Text |
| **Purpose** | Code blocks with syntax highlighting — reusable code patterns, hooks, utilities |
| **Key Fields** | `content` (code text), `language` (programming language for syntax highlighting) |

### 2. Prompt

| Property | Value |
|---|---|
| **Icon** | `Sparkles` (Lucide) |
| **Color** | `#8b5cf6` (Purple) |
| **Content Model** | Text |
| **Purpose** | AI prompts, system messages, and templates for LLM interactions |
| **Key Fields** | `content` (prompt text) |

### 3. Command

| Property | Value |
|---|---|
| **Icon** | `Terminal` (Lucide) |
| **Color** | `#f97316` (Orange) |
| **Content Model** | Text |
| **Purpose** | Terminal/CLI commands and shell scripts for everyday development |
| **Key Fields** | `content` (command text), `language` (typically `"bash"`) |

### 4. Note

| Property | Value |
|---|---|
| **Icon** | `StickyNote` (Lucide) |
| **Color** | `#fde047` (Yellow) |
| **Content Model** | Text |
| **Purpose** | Markdown notes, documentation, explanations, and general-purpose text |
| **Key Fields** | `content` (markdown text) |

### 5. File (Pro)

| Property | Value |
|---|---|
| **Icon** | `File` (Lucide) |
| **Color** | `#6b7280` (Gray) |
| **Content Model** | File |
| **Purpose** | Uploaded documents, configs, and other files stored in Cloudflare R2 |
| **Key Fields** | `fileUrl` (R2 URL), `fileName` (original name), `fileSize` (bytes) |

### 6. Image (Pro)

| Property | Value |
|---|---|
| **Icon** | `Image` (Lucide) |
| **Color** | `#ec4899` (Pink) |
| **Content Model** | File |
| **Purpose** | Screenshots, diagrams, visual assets stored in Cloudflare R2 |
| **Key Fields** | `fileUrl` (R2 URL), `fileName` (original name), `fileSize` (bytes) |

### 7. Link

| Property | Value |
|---|---|
| **Icon** | `Link` (Lucide) |
| **Color** | `#10b981` (Emerald) |
| **Content Model** | URL |
| **Purpose** | Bookmarked URLs — documentation, tools, references |
| **Key Fields** | `url` (the bookmarked URL) |

---

## Shared Properties (All Types)

Every item, regardless of type, has these fields:

| Field | Type | Description |
|---|---|---|
| `id` | `String` | CUID primary key |
| `title` | `String` | Item title (required) |
| `description` | `String?` | Optional description |
| `contentType` | `String` | `"text"`, `"url"`, or `"file"` |
| `isFavorite` | `Boolean` | Whether the item is favorited (default `false`) |
| `isPinned` | `Boolean` | Whether the item is pinned to top (default `false`) |
| `userId` | `String` | Owner (FK to User) |
| `itemTypeId` | `String` | Type classification (FK to ItemType) |
| `tags` | `ItemTag[]` | Many-to-many tags |
| `collections` | `ItemCollection[]` | Many-to-many collections |
| `createdAt` | `DateTime` | Creation timestamp |
| `updatedAt` | `DateTime` | Last update timestamp |

---

## Display Differences

| Aspect | Text Types | URL Type | File Types |
|---|---|---|---|
| **Card display** | Code/text preview | URL with link icon | Filename + size |
| **Drawer view** | Full content with syntax highlighting (snippets/commands) or markdown (notes/prompts) | Clickable link, possibly with preview | File preview/download |
| **Language badge** | Shown for Snippet and Command | N/A | N/A |
| **Color-coded border** | Based on item type color | Emerald border | Gray/Pink border |

---

## Database Schema

### ItemType Model

```prisma
model ItemType {
  id       String  @id @default(cuid())
  name     String              // "Snippet", "Prompt", etc.
  icon     String              // Lucide icon name
  color    String              // Hex color
  isSystem Boolean @default(false)
  userId   String?             // null = system type
  user     User?   @relation(...)
  items    Item[]

  @@unique([name, userId])     // No duplicate names per user
}
```

### Item Model (content fields)

```prisma
model Item {
  // ... shared fields ...
  contentType String   // "text" | "url" | "file"
  content     String?  // Text content (null for file types)
  fileUrl     String?  // R2 URL (file/image types only)
  fileName    String?  // Original filename
  fileSize    Int?     // Size in bytes
  url         String?  // URL (link type only)
  language    String?  // Programming language (snippets/commands)
}
```

---

## Sources

- `prisma/schema.prisma` — Database schema
- `prisma/seed.ts` — System type definitions and seed data
- `context/project-overview.md` — Type specifications and design
