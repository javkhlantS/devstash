# DevStash — Project Overview

> **One hub for all your developer knowledge.**
> Snippets, prompts, commands, notes, links, and files — searchable, organized, AI-enhanced.

---

## Table of Contents

- [Problem](#problem)
- [Target Users](#target-users)
- [Tech Stack](#tech-stack)
- [Data Models (Prisma — Draft)](#data-models-prisma--draft)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Item Types](#item-types)
- [UI & Design System](#ui--design-system)
- [Monetization](#monetization)
- [Key Links & Resources](#key-links--resources)

---

## Problem

Developers keep their essentials scattered across too many places:

| What | Where it ends up |
|---|---|
| Code snippets | VS Code, Notion, GitHub Gists |
| AI prompts | Chat histories |
| Context files | Buried in project dirs |
| Useful links | Browser bookmarks |
| Docs & notes | Random folders |
| Terminal commands | `.bash_history`, `.txt` files |
| Templates | Gists, boilerplate repos |

**The result:** context switching, lost knowledge, and inconsistent workflows.

**DevStash** solves this with a single fast, searchable, AI-enhanced hub for all developer knowledge and resources.

---

## Target Users

| Persona | Core Need |
|---|---|
| **Everyday Developer** | Fast access to snippets, prompts, commands, links |
| **AI-first Developer** | Save and organize prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, API examples |

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) / [React 19](https://react.dev/) | SSR pages with dynamic components. API routes for backend. Single repo. |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | End-to-end type safety |
| **Database** | [Neon](https://neon.tech/) (PostgreSQL) | Serverless Postgres in the cloud |
| **ORM** | [Prisma 7](https://www.prisma.io/) | Schema-first. **Use migrations only — never `db push`.** |
| **Auth** | [NextAuth v5](https://authjs.dev/) | Email/password + GitHub OAuth |
| **File Storage** | [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) | S3-compatible object storage for file/image uploads |
| **AI** | [OpenAI](https://platform.openai.com/) — `gpt-5-nano` | Auto-tagging, summaries, code explanations, prompt optimization |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Utility-first CSS with accessible component primitives |
| **Caching** | Redis *(tentative)* | For hot paths if needed |

### Important Conventions

- **Database changes:** Always create Prisma migrations (`prisma migrate dev`). Never use `db push` or modify the DB directly.
- **Single codebase:** Frontend, API routes, and server actions all live in one Next.js repo.
- **Prisma 7:** Fetch the latest docs before implementation — breaking changes from v6.

---

## Data Models (Prisma — Draft)

> ⚠️ **This is a rough draft.** Field names, types, and relations will evolve during implementation.

```prisma
// schema.prisma (DRAFT — subject to change)

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── User ────────────────────────────────────────────────────
// Extends NextAuth User model

model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String    @unique
  emailVerified         DateTime?
  image                 String?
  isPro                 Boolean   @default(false)
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique

  items       Item[]
  itemTypes   ItemType[]
  collections Collection[]
  tags        Tag[]

  accounts    Account[]
  sessions    Session[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// NextAuth required models (Account, Session, VerificationToken)
// omitted for brevity — follow NextAuth v5 Prisma adapter docs.

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Item ────────────────────────────────────────────────────

model Item {
  id          String   @id @default(cuid())
  title       String
  description String?

  // Content: text-based items store content here
  contentType String   // "text" | "url" | "file"
  content     String?  // text/markdown content (null if file)

  // File uploads (Pro only)
  fileUrl     String?  // Cloudflare R2 URL
  fileName    String?  // Original filename
  fileSize    Int?     // Size in bytes

  // Link type
  url         String?  // URL for link items

  // Metadata
  language    String?  // Programming language (for snippets/commands)
  isFavorite  Boolean  @default(false)
  isPinned    Boolean  @default(false)

  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemTypeId  String
  itemType    ItemType @relation(fields: [itemTypeId], references: [id])

  tags        ItemTag[]
  collections ItemCollection[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([itemTypeId])
  @@index([isPinned])
}

// ─── Item Type ───────────────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String  // "snippet", "prompt", "note", etc.
  icon     String  // Lucide icon name
  color    String  // Hex color
  isSystem Boolean @default(false)

  // null userId = system type; set userId = custom type
  userId   String?
  user     User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items    Item[]

  @@unique([name, userId]) // Prevent duplicate type names per user
}

// ─── Collection ──────────────────────────────────────────────

model Collection {
  id            String  @id @default(cuid())
  name          String  // "React Hooks", "Context Files", etc.
  description   String?
  isFavorite    Boolean @default(false)

  defaultTypeId String? // Suggested type for new items in this collection

  userId        String
  user          User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  items         ItemCollection[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
}

// ─── Join Tables ─────────────────────────────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

// ─── Tags ────────────────────────────────────────────────────

model Tag {
  id     String @id @default(cuid())
  name   String

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items  ItemTag[]

  @@unique([name, userId]) // Unique tag names per user
}

model ItemTag {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

### Entity Relationship Summary

```
User 1──* Item
User 1──* Collection
User 1──* ItemType (custom types)
User 1──* Tag

Item *──1 ItemType
Item *──* Collection  (via ItemCollection)
Item *──* Tag         (via ItemTag)
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                     │
│  Next.js 16 App Router  ·  React 19  ·  Tailwind + shadcn  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    SSR / Server Actions / API Routes
                               │
┌──────────────────────────────┴──────────────────────────────┐
│                     Next.js Server (Node)                   │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │  NextAuth v5 │  │  Prisma ORM  │  │  OpenAI API Client │ │
│  │  (Auth)      │  │  (DB Access)  │  │  gpt-5-nano        │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘ │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
    ┌─────┴─────┐   ┌─────┴──────┐       ┌──────┴───────┐
    │  GitHub    │   │   Neon     │       │   OpenAI     │
    │  OAuth     │   │  Postgres  │       │   API        │
    └───────────┘   └────────────┘       └──────────────┘
                                                │
                    ┌───────────────┐     (AI Features:
                    │ Cloudflare R2 │      auto-tag,
                    │ (File Store)  │      summarize,
                    └───────────────┘      explain,
                                           optimize)
```

---

## Features

### A. Items & Item Types

Items are the core unit. Each item has a **type** that determines its behavior and appearance. System types are built-in and cannot be modified. Users will eventually be able to create custom types (Pro).

**Content models by type:**

| Type | Content Model | Description |
|---|---|---|
| Snippet | `text` | Code blocks with syntax highlighting |
| Prompt | `text` | AI prompts, system messages, templates |
| Note | `text` | Markdown notes, docs, explanations |
| Command | `text` | Terminal/CLI commands |
| Link | `url` | Bookmarked URLs |
| File | `file` *(Pro)* | Uploaded documents, configs |
| Image | `file` *(Pro)* | Screenshots, diagrams, assets |

**URL pattern:** `/items/snippets`, `/items/prompts`, etc.

Items open in a **side drawer** for quick access and editing.

### B. Collections

Collections group items of **any type**. An item can belong to multiple collections.

Examples: "React Patterns" (snippets + notes), "Interview Prep" (snippets + prompts), "Context Files" (files).

### C. Search

Full search across content, titles, tags, and types.

### D. Authentication

Email/password and GitHub OAuth via NextAuth v5.

### E. Additional Features

- Favorite collections and items
- Pin items to top
- Recently used items
- Import code from file
- Markdown editor for text-based types
- File upload for file/image types
- Export data (JSON/ZIP — Pro)
- Dark mode default, light mode optional
- Multi-collection item management
- View which collections an item belongs to

### F. AI Features (Pro)

| Feature | Description |
|---|---|
| **Auto-tag** | AI suggests tags based on item content |
| **Summarize** | Generate a short summary of an item |
| **Explain Code** | AI explains what a code snippet does |
| **Prompt Optimizer** | Rewrite and improve AI prompts |

---

## Item Types

### System Types Reference

| Type | Icon | Color | Hex | Content Model |
|---|---|---|---|---|
| Snippet | `Code` | 🔵 Blue | `#3b82f6` | text |
| Prompt | `Sparkles` | 🟣 Purple | `#8b5cf6` | text |
| Command | `Terminal` | 🟠 Orange | `#f97316` | text |
| Note | `StickyNote` | 🟡 Yellow | `#fde047` | text |
| File | `File` | ⚪ Gray | `#6b7280` | file |
| Image | `Image` | 🩷 Pink | `#ec4899` | file |
| Link | `Link` | 🟢 Emerald | `#10b981` | url |

> Icons are from [Lucide Icons](https://lucide.dev/icons/).

### TypeScript Constants

```typescript
// lib/constants/item-types.ts

export const ITEM_TYPES = {
  snippet:  { name: "Snippet",  icon: "Code",       color: "#3b82f6", contentModel: "text" },
  prompt:   { name: "Prompt",   icon: "Sparkles",    color: "#8b5cf6", contentModel: "text" },
  command:  { name: "Command",  icon: "Terminal",     color: "#f97316", contentModel: "text" },
  note:     { name: "Note",     icon: "StickyNote",   color: "#fde047", contentModel: "text" },
  file:     { name: "File",     icon: "File",         color: "#6b7280", contentModel: "file" },
  image:    { name: "Image",    icon: "Image",        color: "#ec4899", contentModel: "file" },
  link:     { name: "Link",     icon: "Link",         color: "#10b981", contentModel: "url" },
} as const;
```

---

## UI & Design System

### Principles

- Modern, minimal, developer-focused
- Dark mode by default, light mode optional
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting for code blocks

**Design references:** Notion, Linear, Raycast

### Layout

```
┌───────────────────────────────────────────────────┐
│  Sidebar (collapsible)  │      Main Content       │
│                         │                         │
│  🔍 Search              │  ┌─────┐ ┌─────┐ ┌───┐ │
│                         │  │Col. │ │Col. │ │...│ │
│  📦 Item Types          │  │Card │ │Card │ │   │ │
│    ├─ Snippets          │  └─────┘ └─────┘ └───┘ │
│    ├─ Prompts           │                         │
│    ├─ Commands          │  ┌─────┐ ┌─────┐ ┌───┐ │
│    ├─ Notes             │  │Item │ │Item │ │...│ │
│    ├─ Links             │  │Card │ │Card │ │   │ │
│    ├─ Files ⭐          │  └─────┘ └─────┘ └───┘ │
│    └─ Images ⭐         │                         │
│                         │                         │
│  📁 Collections         │    ┌──────────────────┐ │
│    ├─ React Patterns    │    │   Item Drawer     │ │
│    ├─ Interview Prep    │    │   (slides in)     │ │
│    └─ + New Collection  │    └──────────────────┘ │
└───────────────────────────────────────────────────┘
```

- **Collection cards:** Color-coded background based on the most common item type
- **Item cards:** Color-coded border based on item type
- **Item drawer:** Slides in from the right for quick view/edit
- **Mobile:** Sidebar collapses into a hamburger drawer

### Micro-interactions

- Smooth transitions on drawer open/close
- Hover states on cards (subtle lift/glow)
- Toast notifications for CRUD actions
- Loading skeletons during data fetches

---

## Monetization

### Free Tier

- 50 items total
- 3 collections
- All system types **except** File and Image
- Basic search
- No file/image uploads
- No AI features

### Pro — $8/month or $72/year

- Unlimited items and collections
- File & Image uploads (Cloudflare R2)
- Custom item types *(coming later)*
- AI auto-tagging, code explanation, prompt optimizer
- Export data (JSON/ZIP)
- Priority support

**Payments:** Stripe (via `stripeCustomerId` and `stripeSubscriptionId` on User model).

> **Development note:** During development, all users have full access. Pro gating will be wired up before launch.

---

## Key Links & Resources

| Resource | Link |
|---|---|
| Next.js 16 Docs | <https://nextjs.org/docs> |
| React 19 | <https://react.dev> |
| Prisma 7 Docs | <https://www.prisma.io/docs> |
| NextAuth v5 | <https://authjs.dev> |
| Neon Postgres | <https://neon.tech/docs> |
| Cloudflare R2 | <https://developers.cloudflare.com/r2> |
| Tailwind CSS v4 | <https://tailwindcss.com/docs> |
| shadcn/ui | <https://ui.shadcn.com> |
| Lucide Icons | <https://lucide.dev/icons> |
| OpenAI API | <https://platform.openai.com/docs> |
| Stripe Billing | <https://docs.stripe.com/billing> |

---

## Project Structure (Suggested)

```
devstash/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (dashboard)/      # Main app layout
│   │   │   ├── items/
│   │   │   │   └── [type]/   # /items/snippets, /items/prompts, etc.
│   │   │   ├── collections/
│   │   │   │   └── [id]/
│   │   │   └── search/
│   │   └── api/
│   │       ├── items/
│   │       ├── collections/
│   │       ├── ai/
│   │       ├── upload/
│   │       └── auth/
│   ├── components/
│   │   ├── ui/               # shadcn primitives
│   │   ├── items/            # Item card, drawer, forms
│   │   ├── collections/      # Collection card, grid
│   │   ├── layout/           # Sidebar, header, mobile nav
│   │   └── search/
│   ├── lib/
│   │   ├── constants/        # Item types, colors, limits
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # NextAuth config
│   │   ├── r2.ts             # Cloudflare R2 helpers
│   │   ├── ai.ts             # OpenAI client
│   │   ├── stripe.ts         # Stripe helpers
│   │   └── utils.ts
│   └── types/                # Shared TypeScript types
├── public/
├── .env.local
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

*Last updated: March 2026*
