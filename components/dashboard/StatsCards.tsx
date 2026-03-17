import {
  Layers,
  FolderOpen,
  Star,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/db/collections";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats: data }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Items",
      value: data.totalItems,
      icon: Layers,
      color: "#3b82f6",
    },
    {
      label: "Collections",
      value: data.totalCollections,
      icon: FolderOpen,
      color: "#8b5cf6",
    },
    {
      label: "Favorite Items",
      value: data.favoriteItems,
      icon: Star,
      color: "#f97316",
    },
    {
      label: "Favorite Collections",
      value: data.favoriteCollections,
      icon: Heart,
      color: "#ec4899",
    },
  ];
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
