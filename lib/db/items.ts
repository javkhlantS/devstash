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

// ─── Items by Type ──────────────────────────────────────────

export async function getItemsByType(
  typeName: string
): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();

  return prisma.item.findMany({
    where: {
      userId,
      itemType: { name: typeName },
    },
    orderBy: { createdAt: "desc" },
    select: dashboardItemSelect,
  });
}

// ─── Item Detail ────────────────────────────────────────────

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemType: {
    name: string;
    icon: string;
    color: string;
  };
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
  collections: {
    collection: {
      id: string;
      name: string;
    };
  }[];
}

export async function getItemDetail(
  itemId: string
): Promise<ItemDetail | null> {
  const userId = await getDemoUserId();

  return prisma.item.findFirst({
    where: { id: itemId, userId },
    select: {
      id: true,
      title: true,
      description: true,
      contentType: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: {
        select: { name: true, icon: true, color: true },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
      collections: {
        select: {
          collection: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });
}

// ─── Update Item ────────────────────────────────────────────

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
}

export async function updateItem(
  itemId: string,
  _userId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  // TODO: Replace getDemoUserId() with real userId once auth is fully wired up
  const userId = await getDemoUserId();

  // Verify ownership
  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!existing) return null;

  const updated = await prisma.item.update({
    where: { id: itemId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: {
                name_userId: { name: tagName, userId },
              },
              create: { name: tagName, userId },
            },
          },
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      contentType: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: {
        select: { name: true, icon: true, color: true },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
      collections: {
        select: {
          collection: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return updated;
}

// ─── Delete Item ─────────────────────────────────────────────

export async function deleteItem(
  itemId: string,
  _userId: string
): Promise<boolean> {
  // TODO: Replace getDemoUserId() with real userId once auth is fully wired up
  const userId = await getDemoUserId();

  const existing = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { id: true },
  });

  if (!existing) return false;

  await prisma.item.delete({ where: { id: itemId } });
  return true;
}

// ─── Create Item ─────────────────────────────────────────────

export interface CreateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  itemTypeId: string;
  tags: string[];
}

export async function createItem(
  _userId: string,
  data: CreateItemData
): Promise<ItemDetail> {
  // TODO: Replace getDemoUserId() with real userId once auth is fully wired up
  const userId = await getDemoUserId();

  const itemType = await prisma.itemType.findUnique({
    where: { id: data.itemTypeId },
    select: { name: true },
  });

  const contentType =
    itemType?.name === "Link" ? "url" : itemType?.name === "File" || itemType?.name === "Image" ? "file" : "text";

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      contentType,
      userId,
      itemTypeId: data.itemTypeId,
      tags: {
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: {
                name_userId: { name: tagName, userId },
              },
              create: { name: tagName, userId },
            },
          },
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      contentType: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: {
        select: { name: true, icon: true, color: true },
      },
      tags: {
        select: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
      collections: {
        select: {
          collection: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  return item;
}

// ─── Get Item Types ──────────────────────────────────────────

export interface ItemTypeOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export async function getItemTypes(): Promise<ItemTypeOption[]> {
  return prisma.itemType.findMany({
    where: { isSystem: true },
    select: { id: true, name: true, icon: true, color: true },
    orderBy: { name: "asc" },
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
