import {
  Layers,
  FolderOpen,
  Star,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { items, collections } from "@/lib/mock-data";

const stats = [
  {
    label: "Total Items",
    value: items.length,
    icon: Layers,
    color: "#3b82f6",
  },
  {
    label: "Collections",
    value: collections.length,
    icon: FolderOpen,
    color: "#8b5cf6",
  },
  {
    label: "Favorite Items",
    value: items.filter((i) => i.isFavorite).length,
    icon: Star,
    color: "#f97316",
  },
  {
    label: "Favorite Collections",
    value: collections.filter((c) => c.isFavorite).length,
    icon: Heart,
    color: "#ec4899",
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent className="flex items-center gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: stat.color + "18" }}
            >
              <stat.icon
                className="size-5"
                style={{ color: stat.color }}
              />
            </div>
            <div>
              <p className="text-2xl font-bold leading-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
