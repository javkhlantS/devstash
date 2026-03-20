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

interface ItemRowProps {
  item: DashboardItem;
  onClick?: () => void;
}

export function ItemRow({ item, onClick }: ItemRowProps) {
  const Icon = iconMap[item.itemType.icon] ?? null;
  const color = item.itemType.color;
  const tags = item.tags.map((t) => t.tag);

  const formattedDate = item.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50${onClick ? " cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: color + "18" }}
      >
        {Icon && <Icon className="size-4" style={{ color }} />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-medium">{item.title}</h4>
          {item.isPinned && (
            <Pin className="size-3 shrink-0 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="size-3 shrink-0 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {item.description}
        </p>
        {tags.length > 0 && (
          <div className="mt-1.5 flex gap-1.5">
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
      </div>

      <span className="shrink-0 text-xs text-muted-foreground">
        {formattedDate}
      </span>
    </div>
  );
}
