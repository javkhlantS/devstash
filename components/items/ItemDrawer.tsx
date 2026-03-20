"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { ItemDetail } from "@/lib/db/items";
import { updateItem } from "@/actions/items";

// Item types that show the content field
const CONTENT_TYPES = ["snippet", "prompt", "command", "note"];
// Item types that show the language field
const LANGUAGE_TYPES = ["snippet", "command"];

interface ItemDrawerProps {
  itemId: string | null;
  onClose: () => void;
}

interface EditFormState {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
}

function itemToFormState(item: ItemDetail): EditFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.map((t) => t.tag.name).join(", "),
  };
}

export function ItemDrawer({ itemId, onClose }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
  });

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setItem(null);
    setEditing(false);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data = await res.json();
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
      setEditing(false);
    }
  }, [itemId, fetchItem]);

  const handleEdit = () => {
    if (!item) return;
    setForm(itemToFormState(item));
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await updateItem(item.id, {
        title: form.title,
        description: form.description || null,
        content: form.content || null,
        url: form.url || null,
        language: form.language || null,
        tags,
      });

      if (result.success) {
        const updated = result.data;
        updated.createdAt = new Date(updated.createdAt);
        updated.updatedAt = new Date(updated.updatedAt);
        setItem(updated);
        setEditing(false);
        toast.success("Item updated");
        router.refresh();
      } else {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : "Validation failed";
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const open = itemId !== null;
  const tags = item?.tags.map((t) => t.tag) ?? [];
  const collections = item?.collections.map((c) => c.collection) ?? [];
  const color = item?.itemType.color;
  const typeName = item?.itemType.name?.toLowerCase() ?? "";

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
        if (!isOpen) {
          setEditing(false);
          onClose();
        }
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
              {editing ? (
                <>
                  <SheetTitle>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      placeholder="Title"
                      className="text-lg font-semibold"
                    />
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
                  </SheetDescription>
                </>
              ) : (
                <>
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
                </>
              )}
            </SheetHeader>

            {/* Action Bar */}
            <div className="flex items-center gap-1 border-b border-border px-4 pb-3">
              {editing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving || !form.title.trim()}
                  >
                    <Save className="mr-1.5 size-3.5" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="mr-1.5 size-3.5" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <ActionButton
                    icon={Star}
                    label="Favorite"
                    active={item.isFavorite}
                    activeColor="text-yellow-500"
                    activeFill="fill-yellow-500"
                  />
                  <ActionButton
                    icon={Pin}
                    label="Pin"
                    active={item.isPinned}
                  />
                  <ActionButton icon={Copy} label="Copy" />
                  <ActionButton
                    icon={Pencil}
                    label="Edit"
                    onClick={handleEdit}
                  />
                  <div className="flex-1" />
                  <ActionButton
                    icon={Trash2}
                    label="Delete"
                    className="text-muted-foreground hover:text-red-500"
                  />
                </>
              )}
            </div>

            {/* Body */}
            <div className="space-y-5 px-4 pb-6">
              {editing ? (
                <EditForm
                  form={form}
                  setForm={setForm}
                  typeName={typeName}
                />
              ) : (
                <ViewBody
                  item={item}
                  tags={tags}
                  collections={collections}
                  formatDate={formatDate}
                />
              )}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

// ─── Edit Form ──────────────────────────────────────────────

function EditForm({
  form,
  setForm,
  typeName,
}: {
  form: EditFormState;
  setForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  typeName: string;
}) {
  return (
    <>
      {/* Description */}
      <section>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Description
        </label>
        <Textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Optional description"
          rows={2}
        />
      </section>

      {/* Content — snippet, prompt, command, note */}
      {CONTENT_TYPES.includes(typeName) && (
        <section>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Content
          </label>
          <Textarea
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            placeholder="Content"
            rows={8}
            className="font-mono text-xs"
          />
        </section>
      )}

      {/* Language — snippet, command */}
      {LANGUAGE_TYPES.includes(typeName) && (
        <section>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Language
          </label>
          <Input
            value={form.language}
            onChange={(e) =>
              setForm((f) => ({ ...f, language: e.target.value }))
            }
            placeholder="e.g. javascript, bash"
          />
        </section>
      )}

      {/* URL — link */}
      {typeName === "link" && (
        <section>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            URL
          </label>
          <Input
            value={form.url}
            onChange={(e) =>
              setForm((f) => ({ ...f, url: e.target.value }))
            }
            placeholder="https://..."
          />
        </section>
      )}

      {/* Tags */}
      <section>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Tags
        </label>
        <Input
          value={form.tags}
          onChange={(e) =>
            setForm((f) => ({ ...f, tags: e.target.value }))
          }
          placeholder="Comma-separated tags"
        />
      </section>
    </>
  );
}

// ─── View Body ──────────────────────────────────────────────

function ViewBody({
  item,
  tags,
  collections,
  formatDate,
}: {
  item: ItemDetail;
  tags: { id: string; name: string }[];
  collections: { id: string; name: string }[];
  formatDate: (date: Date) => string;
}) {
  return (
    <>
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
    </>
  );
}

// ─── Shared Components ──────────────────────────────────────

function ActionButton({
  icon: Icon,
  label,
  active,
  activeColor,
  activeFill,
  className,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  activeColor?: string;
  activeFill?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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
