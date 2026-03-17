import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

const SYSTEM_ITEM_TYPES = [
  { name: "Snippet", icon: "Code", color: "#3b82f6" },
  { name: "Prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "Command", icon: "Terminal", color: "#f97316" },
  { name: "Note", icon: "StickyNote", color: "#fde047" },
  { name: "File", icon: "File", color: "#6b7280" },
  { name: "Image", icon: "Image", color: "#ec4899" },
  { name: "Link", icon: "Link", color: "#10b981" },
];

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  // ─── System Item Types ──────────────────────────────────────
  const typeMap: Record<string, string> = {};

  for (const type of SYSTEM_ITEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true, userId: null },
    });

    if (existing) {
      await prisma.itemType.update({
        where: { id: existing.id },
        data: { icon: type.icon, color: type.color },
      });
      typeMap[type.name] = existing.id;
    } else {
      const created = await prisma.itemType.create({
        data: {
          name: type.name,
          icon: type.icon,
          color: type.color,
          isSystem: true,
          userId: null,
        },
      });
      typeMap[type.name] = created.id;
    }
  }

  console.log(`Seeded ${SYSTEM_ITEM_TYPES.length} system item types`);

  // ─── Demo User ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: { name: "Demo User", password: passwordHash },
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded demo user: ${user.email}`);

  // ─── Helper ─────────────────────────────────────────────────
  async function createItem(data: {
    title: string;
    description?: string;
    contentType: string;
    content?: string;
    url?: string;
    language?: string;
    isFavorite?: boolean;
    isPinned?: boolean;
    itemTypeName: string;
  }) {
    return prisma.item.create({
      data: {
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        content: data.content,
        url: data.url,
        language: data.language,
        isFavorite: data.isFavorite ?? false,
        isPinned: data.isPinned ?? false,
        userId: user.id,
        itemTypeId: typeMap[data.itemTypeName],
      },
    });
  }

  // ─── Clean existing demo items ──────────────────────────────
  await prisma.itemCollection.deleteMany({
    where: { item: { userId: user.id } },
  });
  await prisma.item.deleteMany({ where: { userId: user.id } });
  await prisma.collection.deleteMany({ where: { userId: user.id } });

  // ─── React Patterns ─────────────────────────────────────────
  const reactPatterns = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      userId: user.id,
      isFavorite: true,
    },
  });

  const reactItems = await Promise.all([
    createItem({
      title: "useDebounce Hook",
      description: "Custom hook for debouncing values",
      contentType: "text",
      language: "typescript",
      itemTypeName: "Snippet",
      isFavorite: true,
      content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
    }),
    createItem({
      title: "useLocalStorage Hook",
      description: "Persist state to localStorage with SSR safety",
      contentType: "text",
      language: "typescript",
      itemTypeName: "Snippet",
      content: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}`,
    }),
    createItem({
      title: "Context Provider Pattern",
      description: "Type-safe context with compound components",
      contentType: "text",
      language: "typescript",
      itemTypeName: "Snippet",
      isPinned: true,
      content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}`,
    }),
  ]);

  for (const item of reactItems) {
    await prisma.itemCollection.create({
      data: { itemId: item.id, collectionId: reactPatterns.id },
    });
  }

  // ─── AI Workflows ───────────────────────────────────────────
  const aiWorkflows = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      userId: user.id,
    },
  });

  const aiItems = await Promise.all([
    createItem({
      title: "Code Review Prompt",
      description: "Thorough code review with actionable feedback",
      contentType: "text",
      itemTypeName: "Prompt",
      isFavorite: true,
      content: `Review the following code for:

1. **Bugs & Logic Errors** — Identify any incorrect behavior or edge cases
2. **Security** — Check for injection, auth issues, data exposure
3. **Performance** — Spot N+1 queries, unnecessary re-renders, memory leaks
4. **Readability** — Suggest naming improvements and simplifications
5. **Best Practices** — Flag anti-patterns and suggest idiomatic alternatives

For each issue found, provide:
- Severity (critical / warning / suggestion)
- Line reference
- Explanation of the problem
- Concrete fix suggestion

Code to review:
\`\`\`
{{paste code here}}
\`\`\``,
    }),
    createItem({
      title: "Documentation Generator",
      description: "Generate comprehensive docs from code",
      contentType: "text",
      itemTypeName: "Prompt",
      content: `Analyze the following code and generate documentation:

1. **Overview** — One paragraph explaining what this code does
2. **Parameters/Props** — Table with name, type, description, default value
3. **Return Value** — What it returns and when
4. **Usage Examples** — 2-3 practical examples
5. **Edge Cases** — Important behaviors to be aware of

Use JSDoc format for the inline documentation.

Code:
\`\`\`
{{paste code here}}
\`\`\``,
    }),
    createItem({
      title: "Refactoring Assistant",
      description: "Guided refactoring with before/after examples",
      contentType: "text",
      itemTypeName: "Prompt",
      content: `Refactor the following code with these goals:

1. **Reduce complexity** — Break down large functions, simplify conditionals
2. **Improve naming** — Use descriptive, intention-revealing names
3. **Extract reusable logic** — Identify patterns that can become utilities
4. **Apply SOLID principles** — Single responsibility, dependency injection
5. **Maintain behavior** — All existing functionality must be preserved

For each change:
- Show the before/after diff
- Explain why the change improves the code
- Rate confidence that behavior is preserved (high/medium/low)

Code to refactor:
\`\`\`
{{paste code here}}
\`\`\``,
    }),
  ]);

  for (const item of aiItems) {
    await prisma.itemCollection.create({
      data: { itemId: item.id, collectionId: aiWorkflows.id },
    });
  }

  // ─── DevOps ─────────────────────────────────────────────────
  const devOps = await prisma.collection.create({
    data: {
      name: "DevOps",
      description: "Infrastructure and deployment resources",
      userId: user.id,
    },
  });

  const devOpsItems = await Promise.all([
    createItem({
      title: "Multi-stage Dockerfile",
      description: "Production-ready Node.js Dockerfile with multi-stage build",
      contentType: "text",
      language: "dockerfile",
      itemTypeName: "Snippet",
      content: `# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
    }),
    createItem({
      title: "Deploy to Production",
      description: "Full deployment script with health check",
      contentType: "text",
      language: "bash",
      itemTypeName: "Command",
      content: `#!/bin/bash
set -euo pipefail

echo "Building Docker image..."
docker build -t myapp:latest .

echo "Running database migrations..."
npx prisma migrate deploy

echo "Deploying container..."
docker compose up -d --remove-orphans

echo "Waiting for health check..."
for i in {1..30}; do
  if curl -sf http://localhost:3000/api/health > /dev/null; then
    echo "Deployment successful!"
    exit 0
  fi
  sleep 2
done

echo "Health check failed!"
exit 1`,
    }),
    createItem({
      title: "Docker Documentation",
      description: "Official Docker reference documentation",
      contentType: "url",
      url: "https://docs.docker.com/reference/",
      itemTypeName: "Link",
    }),
    createItem({
      title: "GitHub Actions Docs",
      description: "CI/CD workflow reference for GitHub Actions",
      contentType: "url",
      url: "https://docs.github.com/en/actions",
      itemTypeName: "Link",
    }),
  ]);

  for (const item of devOpsItems) {
    await prisma.itemCollection.create({
      data: { itemId: item.id, collectionId: devOps.id },
    });
  }

  // ─── Terminal Commands ──────────────────────────────────────
  const terminalCommands = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
      isFavorite: true,
    },
  });

  const terminalItems = await Promise.all([
    createItem({
      title: "Git Interactive Rebase & Cleanup",
      description: "Squash, reorder, and clean up commit history",
      contentType: "text",
      language: "bash",
      itemTypeName: "Command",
      isPinned: true,
      content: `# Interactive rebase last 5 commits
git rebase -i HEAD~5

# Undo last commit but keep changes staged
git reset --soft HEAD~1

# Clean up merged branches
git branch --merged main | grep -v "main" | xargs git branch -d

# Find commits by message
git log --oneline --grep="fix"`,
    }),
    createItem({
      title: "Docker Container Management",
      description: "Common Docker commands for dev workflows",
      contentType: "text",
      language: "bash",
      itemTypeName: "Command",
      content: `# Stop all running containers
docker stop $(docker ps -q)

# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# View container logs (follow mode)
docker logs -f --tail 100 container_name

# Execute shell in running container
docker exec -it container_name sh`,
    }),
    createItem({
      title: "Process Management",
      description: "Find and manage system processes",
      contentType: "text",
      language: "bash",
      itemTypeName: "Command",
      content: `# Find process using a specific port
lsof -i :3000

# Kill process on a port
kill -9 $(lsof -ti :3000)

# List all Node.js processes
ps aux | grep node

# Monitor system resources
top -o cpu

# Watch a command output (refresh every 2s)
watch -n 2 'docker ps'`,
    }),
    createItem({
      title: "Package Manager Utilities",
      description: "Useful yarn and npm commands",
      contentType: "text",
      language: "bash",
      itemTypeName: "Command",
      content: `# Check for outdated packages
yarn outdated

# Upgrade all dependencies interactively
yarn upgrade-interactive --latest

# Why is a package installed?
yarn why package-name

# List all globally installed packages
yarn global list

# Clear yarn cache
yarn cache clean`,
    }),
  ]);

  for (const item of terminalItems) {
    await prisma.itemCollection.create({
      data: { itemId: item.id, collectionId: terminalCommands.id },
    });
  }

  // ─── Design Resources ──────────────────────────────────────
  const designResources = await prisma.collection.create({
    data: {
      name: "Design Resources",
      description: "UI/UX resources and references",
      userId: user.id,
    },
  });

  const designItems = await Promise.all([
    createItem({
      title: "Tailwind CSS Documentation",
      description: "Official Tailwind CSS reference and utility classes",
      contentType: "url",
      url: "https://tailwindcss.com/docs",
      itemTypeName: "Link",
      isFavorite: true,
    }),
    createItem({
      title: "shadcn/ui Components",
      description: "Beautifully designed components built with Radix and Tailwind",
      contentType: "url",
      url: "https://ui.shadcn.com/docs/components",
      itemTypeName: "Link",
    }),
    createItem({
      title: "Radix UI Primitives",
      description: "Unstyled, accessible UI component primitives",
      contentType: "url",
      url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
      itemTypeName: "Link",
    }),
    createItem({
      title: "Lucide Icons",
      description: "Beautiful and consistent icon library for React",
      contentType: "url",
      url: "https://lucide.dev/icons",
      itemTypeName: "Link",
    }),
  ]);

  for (const item of designItems) {
    await prisma.itemCollection.create({
      data: { itemId: item.id, collectionId: designResources.id },
    });
  }

  console.log("Seeded 5 collections with items");
  console.log("Seed complete!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
