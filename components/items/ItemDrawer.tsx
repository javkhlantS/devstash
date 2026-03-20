"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
  Copy,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ItemDetail } from "@/lib/db/items";

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

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setItem(null);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Parse date strings back to Date objects
        data.createdAt = new Date(data.createdAt);
        data.updatedAt = new Date(data.updatedAt);
        setItem(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (itemId) {
      fetchItem(itemId);
    } else {
      setItem(null);
    }
  }, [itemId, fetchItem]);

  const open = itemId !== null;

  const tags = item?.tags.map((t) => t.tag) ?? [];
  const collections = item?.collections.map((c) => c.collection) ?? [];
  const Icon = item ? (iconMap[item.itemType.icon] ?? null) : null;
  const color = item?.itemType.color;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-md"
      >
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          <>
            {/* Header */}
            <SheetHeader className="pr-8">
              <SheetTitle className="text-lg font-semibold">
                {item.title}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <span
                  className="rounded px-1.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: color + "18",
                    color,
                  }}
                >
                  {item.itemType.name}
                </span>
                {item.language && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>

            {/* Action Bar */}
            <div className="flex items-center gap-1 border-b border-border px-4 pb-3">
              <ActionButton
                icon={Star}
                label="Favorite"
                active={item.isFavorite}
                activeColor="text-yellow-500"
                activeFill="fill-yellow-500"
              />
              <ActionButton icon={Pin} label="Pin" active={item.isPinned} />
              <ActionButton icon={Copy} label="Copy" />
              <ActionButton icon={Pencil} label="Edit" />
              <div className="flex-1" />
              <ActionButton
                icon={Trash2}
                label="Delete"
                className="text-muted-foreground hover:text-red-500"
              />
            </div>

            {/* Body */}
            <div className="space-y-5 px-4 pb-6">
              {/* Description */}
              {item.description && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Description
                  </h3>
                  <p className="text-sm">{item.description}</p>
                </section>
              )}

              {/* Content */}
              {item.content && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Content
                  </h3>
                  <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs leading-relaxed ring-1 ring-foreground/5">
                    <code>{item.content}</code>
                  </pre>
                </section>
              )}

              {/* URL */}
              {item.url && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                    URL
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline break-all"
                  >
                    {item.url}
                  </a>
                </section>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Collections */}
              {collections.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Collections
                  </h3>
                  <div className="space-y-1">
                    {collections.map((col) => (
                      <div key={col.id} className="text-sm">
                        {col.name}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Details */}
              <section>
                <h3 className="mb-1.5 text-xs font-medium text-muted-foreground">
                  Details
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  activeColor,
  activeFill,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  activeColor?: string;
  activeFill?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-muted ${
        active ? activeColor ?? "text-foreground" : "text-muted-foreground"
      } ${className ?? ""}`}
      title={label}
    >
      <Icon
        className={`size-3.5 ${active && activeFill ? activeFill : ""}`}
      />
      <span>{label}</span>
    </button>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-24" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="mt-4 h-32 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
