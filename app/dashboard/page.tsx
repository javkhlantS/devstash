import Link from "next/link";
import { Pin } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { collections, items, itemTypes } from "@/lib/mock-data";

// Get the most common item type color for a collection
function getDominantTypeColor(collectionId: string) {
  const collectionItems = items.filter((i) =>
    (i.collectionIds as readonly string[]).includes(collectionId)
  );
  if (collectionItems.length === 0) return undefined;

  const counts: Record<string, number> = {};
  for (const item of collectionItems) {
    counts[item.itemTypeId] = (counts[item.itemTypeId] ?? 0) + 1;
  }
  const topTypeId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return itemTypes.find((t) => t.id === topTypeId)?.color;
}

// Derive type icons per collection from items
function getCollectionTypeIcons(collectionId: string) {
  const typeIds = [
    ...new Set(
      items
        .filter((i) => (i.collectionIds as readonly string[]).includes(collectionId))
        .map((i) => i.itemTypeId)
    ),
  ];
  return typeIds
    .map((id) => {
      const type = itemTypes.find((t) => t.id === id);
      return type ? { icon: type.icon, color: type.color } : null;
    })
    .filter(Boolean) as { icon: string; color: string }[];
}

const sortedCollections = [...collections].sort(
  (a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);

const pinnedItems = items.filter((i) => i.isPinned);
const recentItems = [...items]
  .sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  .slice(0, 10);

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your developer knowledge hub
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Collections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCollections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              typeIcons={getCollectionTypeIcons(col.id)}
              dominantColor={getDominantTypeColor(col.id)}
            />
          ))}
        </div>
      </section>

      {/* Pinned Items */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <div className="rounded-xl bg-card ring-1 ring-foreground/10">
            {pinnedItems.map((item, i) => (
              <div key={item.id}>
                {i > 0 && (
                  <div className="mx-3 border-t border-border" />
                )}
                <ItemRow item={item} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent</h2>
        <div className="rounded-xl bg-card ring-1 ring-foreground/10">
          {recentItems.map((item, i) => (
            <div key={item.id}>
              {i > 0 && (
                <div className="mx-3 border-t border-border" />
              )}
              <ItemRow item={item} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
