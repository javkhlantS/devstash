# Current Feature

## Status

Completed

## Goals

## Notes

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-16** — Initial Next.js and Tailwind CSS setup (Create Next App), project context files added, default assets cleaned up
- **2026-03-17** — Dashboard UI Phase 1 completed: shadcn/ui initialized, button/input components installed, dark mode by default, Geist font configured, dashboard route at /dashboard with layout, top bar (logo, search, new collection/item buttons), sidebar and main area placeholders
- **2026-03-17** — Dashboard UI Phase 2 completed: collapsible sidebar with item types (linked to /items/TYPE), favorite and recent collections, user avatar area, drawer toggle in top bar, animated mobile drawer overlay, shadcn Collapsible/Avatar/Separator/Tooltip/DropdownMenu components, responsive top bar with mobile dropdown for new collection/item actions
- **2026-03-17** — Dashboard UI Phase 3 completed: main content area with 4 stats cards (total items, collections, favorite items, favorite collections), collections grid with color-coded left border and type icons, pinned items section, recent items list, shadcn Card component, expanded mock data for all collections
- **2026-03-17** — Prisma 7 + Neon PostgreSQL setup completed: Prisma 7 with `prisma-client` generator, `prisma.config.ts` for datasource config, Neon serverless adapter (`@prisma/adapter-neon`), full schema with User, Account, Session, VerificationToken, Item, ItemType, Collection, Tag and join tables, indexes and cascade deletes, initial migration applied, Prisma client singleton in `lib/db.ts`, seed script for 7 system item types
- **2026-03-17** — Seed data completed: added `password` field to User model with migration, bcryptjs for hashing, demo user (demo@devstash.io), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 items across Snippet, Prompt, Command, and Link types, favorites and pinned items, updated test-db script to verify all seed data
- **2026-03-17** — Dashboard collections: replaced mock collection data with real Prisma queries from Neon database, created `lib/db/collections.ts` with `getCollections()` and `getDashboardStats()`, dashboard page is now an async server component, StatsCards accepts props, collection card border color derived from most-used item type, type icons shown per collection
