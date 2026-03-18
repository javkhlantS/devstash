import { prisma } from "@/lib/db";

// TODO: Replace with authenticated user ID once auth is wired up
const DEMO_USER_EMAIL = "demo@devstash.io";

async function getDemoUserId() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  return user.id;
}

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  itemType: {
    icon: string;
    color: string;
  };
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
}

const dashboardItemSelect = {
  id: true,
  title: true,
  description: true,
  isFavorite: true,
  isPinned: true,
  createdAt: true,
  itemType: {
    select: { icon: true, color: true },
  },
  tags: {
    select: {
      tag: {
        select: { id: true, name: true },
      },
    },
  },
} as const;

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();

  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { createdAt: "desc" },
    select: dashboardItemSelect,
  });
}

export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();

  return prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: dashboardItemSelect,
  });
}

// ─── Sidebar Data ────────────────────────────────────────────

export interface SidebarItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  _count: { items: number };
}

const ITEM_TYPE_ORDER = [
  "Snippet",
  "Prompt",
  "Command",
  "Note",
  "File",
  "Image",
  "Link",
];

export async function getItemTypesWithCounts(): Promise<SidebarItemType[]> {
  const userId = await getDemoUserId();

  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: {
        select: {
          items: { where: { userId } },
        },
      },
    },
  });

  return types.sort(
    (a, b) => ITEM_TYPE_ORDER.indexOf(a.name) - ITEM_TYPE_ORDER.indexOf(b.name)
  );
}

export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  updatedAt: Date;
  itemCount: number;
  dominantColor: string | undefined;
}

export async function getSidebarCollections(): Promise<SidebarCollection[]> {
  const userId = await getDemoUserId();

  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: {
                select: { color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const colorCounts: Record<string, number> = {};
    for (const ic of col.items) {
      const color = ic.item.itemType.color;
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }

    const dominant = Object.entries(colorCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      updatedAt: col.updatedAt,
      itemCount: col.items.length,
      dominantColor: dominant?.[0],
    };
  });
}
