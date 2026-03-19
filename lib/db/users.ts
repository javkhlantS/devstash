import { prisma } from "@/lib/db";

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
  providers: string[];
}

export interface UserStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: { name: string; icon: string; color: string; count: number }[];
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
      createdAt: true,
      accounts: {
        select: { provider: true },
      },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
    providers: user.accounts.map((a) => a.provider),
  };
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const [totalItems, totalCollections, typeCounts] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: {
        name: true,
        icon: true,
        color: true,
        _count: {
          select: { items: { where: { userId } } },
        },
      },
    }),
  ]);

  return {
    totalItems,
    totalCollections,
    itemsByType: typeCounts
      .map((t) => ({
        name: t.name,
        icon: t.icon,
        color: t.color,
        count: t._count.items,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
