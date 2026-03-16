import Link from "next/link";
import {
  Star,
  MoreHorizontal,
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from "lucide-react";

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

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description: string;
    isFavorite: boolean;
    itemCount: number;
  };
  typeIcons?: { icon: string; color: string }[];
  dominantColor?: string;
}

export function CollectionCard({ collection, typeIcons, dominantColor }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex flex-col gap-2 rounded-xl border-l-[3px] bg-card p-4 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
      style={{ borderLeftColor: dominantColor ?? "transparent" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{collection.name}</h3>
          {collection.isFavorite && (
            <Star className="size-3.5 fill-yellow-500 text-yellow-500" />
          )}
        </div>
        <MoreHorizontal className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="text-xs text-muted-foreground">{collection.itemCount} items</p>
      <p className="line-clamp-1 text-xs text-muted-foreground/70">
        {collection.description}
      </p>
      {typeIcons && typeIcons.length > 0 && (
        <div className="mt-auto flex gap-1.5 pt-1">
          {typeIcons.map(({ icon, color }) => {
            const Icon = iconMap[icon];
            return Icon ? (
              <Icon
                key={icon}
                className="size-3.5"
                style={{ color }}
              />
            ) : null;
          })}
        </div>
      )}
    </Link>
  );
}
