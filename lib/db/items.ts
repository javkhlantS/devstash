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
