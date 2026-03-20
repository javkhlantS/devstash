import Link from "next/link";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardItems } from "@/components/dashboard/DashboardItems";
import { getCollections, getDashboardStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";

export default async function DashboardPage() {
  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getCollections(),
    getDashboardStats(),
    getPinnedItems(),
    getRecentItems(),
  ]);

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
      <StatsCards stats={stats} />

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
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              typeIcons={col.typeIcons}
              dominantColor={col.dominantColor}
            />
          ))}
        </div>
      </section>

      {/* Items with Drawer */}
      <DashboardItems
        pinnedItems={pinnedItems}
        recentItems={recentItems}
      />
    </div>
  );
}
