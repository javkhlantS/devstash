"use client";

import { useState } from "react";
import { Pin } from "lucide-react";
import { ItemRow } from "@/components/dashboard/ItemRow";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import type { DashboardItem } from "@/lib/db/items";

interface DashboardItemsProps {
  pinnedItems: DashboardItem[];
  recentItems: DashboardItem[];
}

export function DashboardItems({
  pinnedItems,
  recentItems,
}: DashboardItemsProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return (
    <>
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
                <ItemRow
                  item={item}
                  onClick={() => setSelectedItemId(item.id)}
                />
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
              <ItemRow
                item={item}
                onClick={() => setSelectedItemId(item.id)}
              />
            </div>
          ))}
        </div>
      </section>

      <ItemDrawer
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}
