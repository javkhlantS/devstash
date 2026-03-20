# Current Feature: Item Drawer Edit Mode

## Status

In Progress

## Goals

- Edit button in drawer action bar toggles inline edit mode (no separate page/modal)
- Action bar replaced with Save and Cancel buttons in edit mode
- Editable fields: Title (required), Description, Tags (comma-separated input)
- Type-specific fields: Content (snippet/prompt/command/note), Language (snippet/command), URL (link)
- Non-editable display: item type, collections, dates
- Zod validation in server action with error feedback
- `updateItem` server action in `actions/items.ts` with `{ success, data, error }` pattern
- Tag handling: disconnect all existing, connect-or-create new ones
- Toast on save success/error, `router.refresh()` after save
- Save button disabled when title is empty

## Notes

- No form library — controlled inputs with local state
- Content textarea is plain text, not a code editor (that comes later)
- Server action validates ownership via `auth()` session
- Returns updated `ItemDetail` so drawer refreshes without a second fetch
- Query function `updateItem` goes in `lib/db/items.ts`

## History

<!-- Keep this updated. Earliest to latest -->

- **2026-03-16** — Initial Next.js and Tailwind CSS setup (Create Next App), project context files added, default assets cleaned up
- **2026-03-17** — Dashboard UI Phase 1 completed: shadcn/ui initialized, button/input components installed, dark mode by default, Geist font configured, dashboard route at /dashboard with layout, top bar (logo, search, new collection/item buttons), sidebar and main area placeholders
- **2026-03-17** — Dashboard UI Phase 2 completed: collapsible sidebar with item types (linked to /items/TYPE), favorite and recent collections, user avatar area, drawer toggle in top bar, animated mobile drawer overlay, shadcn Collapsible/Avatar/Separator/Tooltip/DropdownMenu components, responsive top bar with mobile dropdown for new collection/item actions
- **2026-03-17** — Dashboard UI Phase 3 completed: main content area with 4 stats cards (total items, collections, favorite items, favorite collections), collections grid with color-coded left border and type icons, pinned items section, recent items list, shadcn Card component, expanded mock data for all collections
- **2026-03-17** — Prisma 7 + Neon PostgreSQL setup completed: Prisma 7 with `prisma-client` generator, `prisma.config.ts` for datasource config, Neon serverless adapter (`@prisma/adapter-neon`), full schema with User, Account, Session, VerificationToken, Item, ItemType, Collection, Tag and join tables, indexes and cascade deletes, initial migration applied, Prisma client singleton in `lib/db.ts`, seed script for 7 system item types
- **2026-03-17** — Seed data completed: added `password` field to User model with migration, bcryptjs for hashing, demo user (demo@devstash.io), 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 items across Snippet, Prompt, Command, and Link types, favorites and pinned items, updated test-db script to verify all seed data
- **2026-03-17** — Dashboard collections: replaced mock collection data with real Prisma queries from Neon database, created `lib/db/collections.ts` with `getCollections()` and `getDashboardStats()`, dashboard page is now an async server component, StatsCards accepts props, collection card border color derived from most-used item type, type icons shown per collection
- **2026-03-17** — Dashboard items: replaced mock item data with real Prisma queries, created `lib/db/items.ts` with `getPinnedItems()` and `getRecentItems()`, updated `ItemRow` component to use `DashboardItem` interface with item type icon/color and tags from database, pinned section hidden when empty, all data fetched in parallel via `Promise.all()`
- **2026-03-18** — Stats & sidebar: replaced mock data in sidebar with real Prisma queries, added `getItemTypesWithCounts()` and `getSidebarCollections()` to `lib/db/items.ts`, sidebar item types show database counts with custom display order, favorite collections keep star icons, recent collections show colored circle based on dominant item type, added "View all collections" link, layout fetches sidebar data server-side and passes as props
- **2026-03-18** — Pro badge: added shadcn Badge component, PRO badge shown next to Files and Images types in sidebar using secondary variant with compact styling
- **2026-03-19** — Auth setup: NextAuth v5 with Prisma adapter and GitHub OAuth, split config pattern for edge compatibility (`auth.config.ts` + `auth.ts`), JWT session strategy, `/dashboard` route protection via `proxy.ts`, NextAuth API route, Session type extended with `user.id`
- **2026-03-19** — Auth credentials: added Credentials provider with split config pattern (placeholder in `auth.config.ts`, bcrypt validation in `auth.ts`), registration API route at `/api/auth/register` with input validation, duplicate check, and bcrypt password hashing
- **2026-03-19** — Auth UI: custom sign-in page (`/sign-in`) with email/password and GitHub OAuth, custom register page (`/register`) with validation and success toast, reusable `UserAvatar` component (GitHub image or initials fallback), sidebar user area with dropdown menu (Profile link, Sign out), dashboard layout uses `auth()` session, NextAuth configured for custom pages, sonner toast library added
- **2026-03-19** — Email verification: Resend integration for verification emails on register, `lib/tokens.ts` for token generation/validation with 24hr expiry using existing `VerificationToken` model, `/verify-email` page validates token and sets `emailVerified`, Credentials provider rejects unverified users with `EmailNotVerifiedError`, sign-in page shows specific message for unverified accounts, register page shows "Check your email" card after submission
- **2026-03-20** — Email verification toggle: `REQUIRE_EMAIL_VERIFICATION` env var (default `false`) controls whether email verification is required on register, when disabled auto-sets `emailVerified`, skips sending verification email, and redirects to sign-in instead of "check email" screen
- **2026-03-20** — Forgot password: "Forgot password?" link on sign-in page, `/forgot-password` page sends reset email via Resend, `/reset-password` page validates token and updates password with bcrypt, reuses `VerificationToken` model with `password-reset:` prefix, 1hr token expiry, no email enumeration, API routes at `/api/auth/forgot-password` and `/api/auth/reset-password`
- **2026-03-20** — Profile page: `/dashboard/profile` with user info (avatar, email, name, join date, GitHub connection), usage stats (total items/collections, breakdown by item type with icons), change password form (email users only), delete account with confirmation dialog, `lib/db/users.ts` for data fetching, shadcn Dialog component added
- **2026-03-20** — Rate limiting: Upstash Redis + `@upstash/ratelimit` with sliding window algorithm, reusable `lib/rate-limit.ts` utility with fail-open behavior, login (5/15min by IP+email), register (3/1hr by IP), forgot-password (3/1hr by IP), reset-password (5/15min by IP), 429 responses with `Retry-After` header, `RATE_LIMITED` error handling on sign-in form
- **2026-03-20** — Items list view: dynamic route at `/dashboard/items/[type]` with slug validation, `getItemsByType()` Prisma query, `ItemCard` component with type-colored left border and icon, responsive 2-column grid on md+, empty state, sidebar links updated to `/dashboard/items/{slug}`
- **2026-03-20** — Item drawer: right-side shadcn Sheet opens on item card/row click, fetches full item detail via `/api/items/[id]` with `getItemDetail()` query, displays description, content, URL, tags, collections, and dates, action bar with Favorite/Pin/Copy/Edit/Delete buttons (visual only), skeleton loading state, works on both dashboard and items list pages, `DashboardItems` and `ItemListWithDrawer` client wrappers for drawer state
