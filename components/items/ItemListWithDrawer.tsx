"use client";

import { useState } from "react";
import { ItemCard } from "@/components/items/ItemCard";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import type { DashboardItem } from "@/lib/db/items";

interface ItemListWithDrawerProps {
  items: DashboardItem[];
}

export function ItemListWithDrawer({ items }: ItemListWithDrawerProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onClick={() => setSelectedItemId(item.id)}
          />
        ))}
      </div>
      <ItemDrawer
        itemId={selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
}
