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

export interface CollectionWithMeta {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  updatedAt: Date;
  typeIcons: { icon: string; color: string }[];
  dominantColor: string | undefined;
}

export async function getCollections(): Promise<CollectionWithMeta[]> {
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
                select: { icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const typeCounts: Record<string, { icon: string; color: string; count: number }> = {};

    for (const ic of col.items) {
      const { icon, color } = ic.item.itemType;
      const key = icon;
      if (typeCounts[key]) {
        typeCounts[key].count++;
      } else {
        typeCounts[key] = { icon, color, count: 1 };
      }
    }

    const entries = Object.values(typeCounts);
    const dominant = entries.sort((a, b) => b.count - a.count)[0];

    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      itemCount: col.items.length,
      updatedAt: col.updatedAt,
      typeIcons: entries.map(({ icon, color }) => ({ icon, color })),
      dominantColor: dominant?.color,
    };
  });
}

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await getDemoUserId();

  const [totalItems, totalCollections, favoriteItems, favoriteCollections] =
    await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}
