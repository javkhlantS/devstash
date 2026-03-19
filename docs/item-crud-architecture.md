# Item CRUD Architecture

> Unified CRUD design for all 7 item types in DevStash.

---

## Design Principles

1. **One route, one set of actions** — all types share the same dynamic route and server actions
2. **Type-specific logic in components** — actions and queries are type-agnostic; rendering differences live in components
3. **Server components fetch, client components mutate** — data fetching in `lib/db/`, mutations via server actions in `actions/`
4. **Content model drives form fields** — text types show a content editor, URL types show a URL input, file types show an upload zone

---

## File Structure

```
app/
  dashboard/
    items/
      [type]/
        page.tsx              # Server component — fetches items by type, renders list
    layout.tsx                # Existing dashboard layout (sidebar, top bar)

actions/
  items.ts                    # Server actions: createItem, updateItem, deleteItem,
                              #   toggleFavorite, togglePin

lib/
  db/
    items.ts                  # Existing + new query functions:
                              #   getItemsByType(), getItemById(), searchItems()
  validations/
    items.ts                  # Zod schemas for item create/update (per content model)

components/
  items/
    ItemList.tsx              # Client — list of ItemCards with empty state
    ItemCard.tsx              # Client — card with type-colored border, click to open drawer
    ItemDrawer.tsx            # Client — slide-in drawer for view/edit
    ItemForm.tsx              # Client — unified create/edit form
    ContentEditor.tsx         # Client — text/markdown editor (Snippet, Prompt, Command, Note)
    UrlInput.tsx              # Client — URL input with validation (Link)
    FileUpload.tsx            # Client — drag-and-drop upload zone (File, Image) [Pro]
    ItemActions.tsx           # Client — favorite, pin, delete actions
    CodeBlock.tsx             # Shared — syntax-highlighted code display
```

---

## Routing: `/items/[type]`

The `[type]` param is the **lowercase item type name** (e.g., `snippets`, `prompts`, `commands`, `notes`, `links`, `files`, `images`).

### `app/dashboard/items/[type]/page.tsx`

```
Server Component
  1. Extract `type` from params (e.g., "snippets")
  2. Map slug to ItemType name (e.g., "snippets" → "Snippet")
  3. Validate type exists (404 if not)
  4. Fetch items via getItemsByType(userId, typeName)
  5. Fetch type metadata (icon, color) for page header
  6. Render <ItemList items={items} type={typeMetadata} />
```

### Slug-to-Type Mapping

```typescript
// lib/constants/item-types.ts

export const ITEM_TYPE_SLUGS: Record<string, string> = {
  snippets: "Snippet",
  prompts: "Prompt",
  commands: "Command",
  notes: "Note",
  files: "File",
  images: "Image",
  links: "Link",
};

export const ITEM_TYPE_SLUG_REVERSE: Record<string, string> =
  Object.fromEntries(
    Object.entries(ITEM_TYPE_SLUGS).map(([k, v]) => [v, k])
  );
```

---

## Data Fetching: `lib/db/items.ts`

New query functions added to the existing file:

### `getItemsByType(userId, typeName, options?)`

```typescript
interface GetItemsByTypeOptions {
  orderBy?: "recent" | "title" | "favorite";
  search?: string;
  limit?: number;
  offset?: number;
}

// Returns items filtered by type with full content for display
// Includes: content, url, fileUrl, fileName, fileSize, language, tags, collections
```

### `getItemById(userId, itemId)`

```typescript
// Returns a single item with all fields for the drawer/edit view
// Includes: all Item fields + itemType + tags + collections
// Validates ownership (userId must match)
```

### `getItemTypeByName(typeName)`

```typescript
// Returns the system ItemType record (id, name, icon, color)
// Used to resolve type slug → typeId for queries and creates
```

---

## Mutations: `actions/items.ts`

All mutations are **Server Actions** using the `"use server"` directive. They follow the existing `{ success, data, error }` pattern.

### `createItem(formData)`

```typescript
"use server"

// 1. Get session (auth check)
// 2. Parse & validate with Zod (schema varies by contentType)
// 3. Resolve itemTypeId from type name
// 4. For file/image: upload to R2, get fileUrl (future)
// 5. prisma.item.create({ data })
// 6. Return { success: true, data: item }
```

### `updateItem(itemId, formData)`

```typescript
"use server"

// 1. Auth check + ownership verification
// 2. Parse & validate with Zod
// 3. For file/image: handle file replacement if needed
// 4. prisma.item.update({ where: { id, userId }, data })
// 5. Return { success: true, data: item }
```

### `deleteItem(itemId)`

```typescript
"use server"

// 1. Auth check + ownership verification
// 2. For file/image: delete from R2 (future)
// 3. prisma.item.delete({ where: { id, userId } })
//    (Cascade deletes ItemTag and ItemCollection rows)
// 4. revalidatePath for the item's type page
// 5. Return { success: true }
```

### `toggleFavorite(itemId)` / `togglePin(itemId)`

```typescript
"use server"

// 1. Auth check + ownership verification
// 2. Read current value, flip it
// 3. prisma.item.update({ where: { id, userId }, data: { isFavorite: !current } })
// 4. revalidatePath
// 5. Return { success: true, data: { isFavorite: newValue } }
```

---

## Validation: `lib/validations/items.ts`

Zod schemas that adapt based on content model:

```typescript
import { z } from "zod";

// Shared fields across all types
const baseItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  itemTypeName: z.string(), // "Snippet", "Prompt", etc.
});

// Text content types: Snippet, Prompt, Command, Note
export const textItemSchema = baseItemSchema.extend({
  contentType: z.literal("text"),
  content: z.string().min(1),
  language: z.string().optional(), // for Snippet and Command
});

// URL content type: Link
export const urlItemSchema = baseItemSchema.extend({
  contentType: z.literal("url"),
  url: z.string().url(),
});

// File content types: File, Image (Pro only)
export const fileItemSchema = baseItemSchema.extend({
  contentType: z.literal("file"),
  // fileUrl, fileName, fileSize populated by upload handler
});

// Discriminated union for all types
export const createItemSchema = z.discriminatedUnion("contentType", [
  textItemSchema,
  urlItemSchema,
  fileItemSchema,
]);
```

---

## Component Responsibilities

### `ItemList` (Client Component)

- Receives items array and type metadata as props
- Renders grid/list of `ItemCard` components
- Shows empty state when no items ("No snippets yet. Create your first one.")
- Contains "New Item" button that opens `ItemDrawer` in create mode
- Handles list-level state (selected item, drawer open/closed)

### `ItemCard` (Client Component)

- Displays item summary: title, description preview, language badge, tags
- Left border colored by item type
- Hover state with subtle lift
- Click opens `ItemDrawer` for that item
- Quick actions on hover: favorite, pin, delete

### `ItemDrawer` (Client Component)

- Slides in from the right (same pattern as project spec)
- Two modes: **view** and **edit**
- View mode: displays full content with type-specific rendering
  - Text types: syntax-highlighted code (Snippet/Command) or rendered markdown (Note/Prompt)
  - URL type: clickable link with preview
  - File/Image: download link or image preview
- Edit mode: renders `ItemForm`
- Header: item title, type icon, edit/close buttons

### `ItemForm` (Client Component)

- Unified form for create and edit
- Renders different content fields based on `contentType`:
  - `"text"` → `ContentEditor` (textarea/code editor + optional language selector)
  - `"url"` → `UrlInput` (URL input with validation feedback)
  - `"file"` → `FileUpload` (drag-and-drop zone) [Pro only]
- Shared fields always shown: title, description
- Submits via server action (`createItem` or `updateItem`)
- Shows toast on success/error

### `ContentEditor` (Client Component)

- Textarea/code editor for text-based content
- Language selector dropdown (for Snippet and Command types)
- Future: Monaco editor or CodeMirror integration

### `ItemActions` (Client Component)

- Favorite toggle (star icon, calls `toggleFavorite` action)
- Pin toggle (pin icon, calls `togglePin` action)
- Delete with confirmation dialog (calls `deleteItem` action)
- Uses `useTransition` for optimistic UI updates

---

## Where Type-Specific Logic Lives

| Concern | Location | Example |
|---|---|---|
| **Which fields to show in form** | `ItemForm.tsx` | Show language selector only for Snippet/Command |
| **How to render content** | `ItemDrawer.tsx` | Syntax highlight for Snippet, markdown for Note |
| **Slug ↔ type mapping** | `lib/constants/item-types.ts` | `"snippets"` → `"Snippet"` |
| **Validation rules** | `lib/validations/items.ts` | Text types require `content`, URL types require valid `url` |
| **Content model** | `lib/constants/item-types.ts` | `"Snippet"` → `contentModel: "text"` |
| **Icon + color** | Database (`ItemType` table) | Queried at render time, not hardcoded in components |
| **Pro gating** | `ItemForm.tsx` / route page | File/Image types check `user.isPro` |

**Actions and queries are completely type-agnostic.** They operate on the `Item` model directly. The `contentType` field determines which database columns are populated, but the action code doesn't branch on type.

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│  /dashboard/items/[type]/page.tsx  (Server Component)   │
│                                                         │
│  1. Map slug → type name                                │
│  2. getItemsByType(userId, typeName)                    │
│  3. getItemTypeByName(typeName)                         │
│  4. Render <ItemList items={...} type={...} />          │
└────────────────────────┬────────────────────────────────┘
                         │ props
                         ▼
┌─────────────────────────────────────────────────────────┐
│  ItemList (Client)                                      │
│    ├─ ItemCard[]  ──click──→  ItemDrawer                │
│    │                            ├─ View mode (content)  │
│    │                            └─ Edit mode (ItemForm) │
│    └─ "New" button ──click──→  ItemDrawer (create mode) │
│                                   └─ ItemForm           │
│                                       ├─ ContentEditor  │
│                                       ├─ UrlInput       │
│                                       └─ FileUpload     │
└────────────────────────┬────────────────────────────────┘
                         │ server actions
                         ▼
┌─────────────────────────────────────────────────────────┐
│  actions/items.ts                                       │
│    createItem() → validate → prisma.create → revalidate │
│    updateItem() → validate → prisma.update → revalidate │
│    deleteItem() → auth → prisma.delete → revalidate     │
│    toggleFavorite() / togglePin() → prisma.update        │
└─────────────────────────────────────────────────────────┘
```

---

## Existing Patterns Preserved

- **`lib/db/` for queries** — matches existing `lib/db/items.ts` and `lib/db/collections.ts`
- **`Promise.all()` for parallel fetches** — matches dashboard page pattern
- **`DashboardItem` interface** — existing interface extended, not replaced
- **`iconMap` in components** — same Lucide icon mapping pattern from `ItemRow.tsx`
- **Server components as page-level data fetchers** — matches `dashboard/page.tsx`

---

## Sources

- `prisma/schema.prisma` — Item and ItemType models
- `lib/db/items.ts` — Existing query patterns
- `lib/db/collections.ts` — Existing query patterns
- `app/dashboard/page.tsx` — Existing data flow
- `components/dashboard/ItemRow.tsx` — Existing component patterns
- `docs/item-types.md` — Type reference (content models, fields)
- `context/project-overview.md` — Architecture and feature spec
