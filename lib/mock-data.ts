// Mock data for dashboard UI development
// Remove this file once the database is connected

// ─── Current User ───────────────────────────────────────────

export const currentUser = {
  id: "user_1",
  name: "John Doe",
  email: "demo@devstash.com",
  image: null,
  isPro: true,
};

// ─── Item Types (System) ────────────────────────────────────

export const itemTypes = [
  {
    id: "type_snippet",
    name: "Snippet",
    icon: "Code",
    color: "#3b82f6",
    isSystem: true,
  },
  {
    id: "type_prompt",
    name: "Prompt",
    icon: "Sparkles",
    color: "#8b5cf6",
    isSystem: true,
  },
  {
    id: "type_command",
    name: "Command",
    icon: "Terminal",
    color: "#f97316",
    isSystem: true,
  },
  {
    id: "type_note",
    name: "Note",
    icon: "StickyNote",
    color: "#fde047",
    isSystem: true,
  },
  {
    id: "type_file",
    name: "File",
    icon: "File",
    color: "#6b7280",
    isSystem: true,
  },
  {
    id: "type_image",
    name: "Image",
    icon: "Image",
    color: "#ec4899",
    isSystem: true,
  },
  {
    id: "type_link",
    name: "Link",
    icon: "Link",
    color: "#10b981",
    isSystem: true,
  },
] as const;

// ─── Tags ───────────────────────────────────────────────────

export const tags = [
  { id: "tag_1", name: "react" },
  { id: "tag_2", name: "auth" },
  { id: "tag_3", name: "hooks" },
  { id: "tag_4", name: "python" },
  { id: "tag_5", name: "git" },
  { id: "tag_6", name: "docker" },
  { id: "tag_7", name: "api" },
  { id: "tag_8", name: "css" },
  { id: "tag_9", name: "typescript" },
  { id: "tag_10", name: "nextjs" },
];

// ─── Collections ────────────────────────────────────────────

export const collections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T14:30:00Z",
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
    createdAt: "2026-02-12T09:00:00Z",
    updatedAt: "2026-03-14T11:00:00Z",
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: false,
    itemCount: 5,
    createdAt: "2026-02-15T08:00:00Z",
    updatedAt: "2026-03-13T16:00:00Z",
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
    createdAt: "2026-01-20T12:00:00Z",
    updatedAt: "2026-03-16T09:00:00Z",
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-03-12T15:00:00Z",
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
    createdAt: "2026-02-20T11:00:00Z",
    updatedAt: "2026-03-11T10:00:00Z",
  },
];

// ─── Items ──────────────────────────────────────────────────

export const items = [
  {
    id: "item_1",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "text" as const,
    content: `import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    checkAuth().then(setUser).finally(() => setLoading(false));
  }, []);

  return { user, loading };
}`,
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    itemTypeId: "type_snippet",
    tagIds: ["tag_1", "tag_2", "tag_3"],
    collectionIds: ["col_1"],
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "text" as const,
    content: `async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: true,
    itemTypeId: "type_snippet",
    tagIds: ["tag_7", "tag_9"],
    collectionIds: ["col_1"],
    createdAt: "2026-03-12T08:00:00Z",
    updatedAt: "2026-03-12T08:00:00Z",
  },
  {
    id: "item_3",
    title: "Git Interactive Rebase",
    description: "Squash last N commits into one",
    contentType: "text" as const,
    content: "git rebase -i HEAD~3",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tagIds: ["tag_5"],
    collectionIds: ["col_5"],
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "item_4",
    title: "Docker Compose Cleanup",
    description: "Remove all stopped containers, networks, and volumes",
    contentType: "text" as const,
    content:
      "docker compose down -v --remove-orphans && docker system prune -f",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_command",
    tagIds: ["tag_6"],
    collectionIds: ["col_5"],
    createdAt: "2026-03-08T11:00:00Z",
    updatedAt: "2026-03-08T11:00:00Z",
  },
  {
    id: "item_5",
    title: "Code Review Prompt",
    description: "Prompt for thorough code review with AI",
    contentType: "text" as const,
    content: `Review this code for:
1. Security vulnerabilities
2. Performance issues
3. Error handling gaps
4. Code style and readability
5. Edge cases

Provide specific suggestions with code examples for each issue found.`,
    language: null,
    isFavorite: true,
    isPinned: false,
    itemTypeId: "type_prompt",
    tagIds: [],
    collectionIds: ["col_6"],
    createdAt: "2026-03-05T09:00:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
  },
  {
    id: "item_6",
    title: "React Component Architecture Notes",
    description: "Notes on structuring React component hierarchies",
    contentType: "text" as const,
    content: `## Component Architecture

- **Container components**: Handle data fetching and state
- **Presentational components**: Pure UI, receive props
- **Layout components**: Handle spacing, grid, responsive
- **Feature components**: Combine container + presentational for a feature`,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_note",
    tagIds: ["tag_1"],
    collectionIds: ["col_1", "col_4"],
    createdAt: "2026-03-01T16:00:00Z",
    updatedAt: "2026-03-01T16:00:00Z",
  },
  {
    id: "item_7",
    title: "Tailwind CSS Cheatsheet",
    description: "Quick reference for common Tailwind utilities",
    contentType: "url" as const,
    content: null,
    url: "https://tailwindcomponents.com/cheatsheet",
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_link",
    tagIds: ["tag_8"],
    collectionIds: [],
    createdAt: "2026-02-28T13:00:00Z",
    updatedAt: "2026-02-28T13:00:00Z",
  },
  {
    id: "item_8",
    title: "Python List Comprehension Examples",
    description: "Common list comprehension patterns",
    contentType: "text" as const,
    content: `# Filter and transform
evens = [x for x in range(20) if x % 2 == 0]

# Nested comprehension
matrix = [[1,2,3],[4,5,6],[7,8,9]]
flat = [x for row in matrix for x in row]

# Dictionary comprehension
word_lengths = {w: len(w) for w in ["hello", "world"]}`,
    language: "python",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tagIds: ["tag_4"],
    collectionIds: ["col_2"],
    createdAt: "2026-02-25T10:00:00Z",
    updatedAt: "2026-02-25T10:00:00Z",
  },
  {
    id: "item_9",
    title: "System Prompt Template",
    description: "Base template for creating AI system prompts",
    contentType: "text" as const,
    content: `You are a [role]. Your task is to [task].

## Rules
- [Rule 1]
- [Rule 2]

## Output Format
[Describe expected output]

## Examples
[Provide examples]`,
    language: null,
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_prompt",
    tagIds: [],
    collectionIds: ["col_6"],
    createdAt: "2026-02-20T14:00:00Z",
    updatedAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "item_10",
    title: "Next.js API Route Template",
    description: "Boilerplate for Next.js App Router API routes",
    contentType: "text" as const,
    content: `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const data = await getData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}`,
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    itemTypeId: "type_snippet",
    tagIds: ["tag_10", "tag_9"],
    collectionIds: ["col_1"],
    createdAt: "2026-02-18T09:00:00Z",
    updatedAt: "2026-02-18T09:00:00Z",
  },
];

// ─── Item counts per type (for sidebar) ─────────────────────

export const itemCountsByType = {
  type_snippet: 24,
  type_prompt: 18,
  type_command: 15,
  type_note: 12,
  type_file: 5,
  type_image: 3,
  type_link: 8,
} as const;
