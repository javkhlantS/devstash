import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Pin,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DashboardItem } from "@/lib/db/items";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

interface ItemCardProps {
  item: DashboardItem;
  onClick?: () => void;
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  const Icon = iconMap[item.itemType.icon] ?? null;
  const color = item.itemType.color;
  const tags = item.tags.map((t) => t.tag);

  const formattedDate = item.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Card
      className={`overflow-hidden transition-colors hover:bg-muted/30${onClick ? " cursor-pointer" : ""}`}
      style={{ borderLeftColor: color, borderLeftWidth: "3px" }}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-0">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: color + "18" }}
        >
          {Icon && <Icon className="size-4" style={{ color }} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{item.title}</h3>
            {item.isPinned && (
              <Pin className="size-3 shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="size-3 shrink-0 fill-yellow-500 text-yellow-500" />
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formattedDate}
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {item.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {item.description}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
