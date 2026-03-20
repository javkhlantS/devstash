"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { createItem } from "@/actions/items";
import type { ItemTypeOption } from "@/lib/db/items";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
};

// Item types that show the content field
const CONTENT_TYPES = ["Snippet", "Prompt", "Command", "Note"];
// Item types that show the language field
const LANGUAGE_TYPES = ["Snippet", "Command"];

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: ItemTypeOption[];
}

export function NewItemDialog({
  open,
  onOpenChange,
  itemTypes,
}: NewItemDialogProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Filter out File and Image (Pro-only upload types)
  const availableTypes = itemTypes.filter(
    (t) => t.name !== "File" && t.name !== "Image"
  );

  const [selectedTypeId, setSelectedTypeId] = useState(
    availableTypes[0]?.id ?? ""
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tags: "",
  });

  const selectedType = availableTypes.find((t) => t.id === selectedTypeId);
  const typeName = selectedType?.name ?? "";

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      content: "",
      url: "",
      language: "",
      tags: "",
    });
    setSelectedTypeId(availableTypes[0]?.id ?? "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const result = await createItem({
        title: form.title,
        description: form.description || null,
        content: form.content || null,
        url: form.url || null,
        language: form.language || null,
        itemTypeId: selectedTypeId,
        tags,
      });

      if (result.success) {
        toast.success("Item created");
        resetForm();
        onOpenChange(false);
        router.refresh();
      } else {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : "Validation failed";
        toast.error(errorMsg);
      }
    } catch {
      toast.error("Failed to create item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
          <DialogDescription>
            Create a new item in your collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Item Type Selector */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => {
                const Icon = iconMap[type.icon];
                const isSelected = type.id === selectedTypeId;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedTypeId(type.id)}
                    className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? "border-foreground/20 bg-muted text-foreground"
                        : "border-transparent text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className="size-3.5"
                      />
                    )}
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="new-item-title">Title</Label>
            <Input
              id="new-item-title"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Item title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="new-item-desc">Description</Label>
            <Textarea
              id="new-item-desc"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* Content — snippet, prompt, command, note */}
          {CONTENT_TYPES.includes(typeName) && (
            <div className="space-y-2">
              <Label htmlFor="new-item-content">Content</Label>
              <Textarea
                id="new-item-content"
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Content"
                rows={6}
                className="font-mono text-xs"
              />
            </div>
          )}

          {/* Language — snippet, command */}
          {LANGUAGE_TYPES.includes(typeName) && (
            <div className="space-y-2">
              <Label htmlFor="new-item-lang">Language</Label>
              <Input
                id="new-item-lang"
                value={form.language}
                onChange={(e) =>
                  setForm((f) => ({ ...f, language: e.target.value }))
                }
                placeholder="e.g. javascript, bash"
              />
            </div>
          )}

          {/* URL — link */}
          {typeName === "Link" && (
            <div className="space-y-2">
              <Label htmlFor="new-item-url">URL</Label>
              <Input
                id="new-item-url"
                value={form.url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, url: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="new-item-tags">Tags</Label>
            <Input
              id="new-item-tags"
              value={form.tags}
              onChange={(e) =>
                setForm((f) => ({ ...f, tags: e.target.value }))
              }
              placeholder="Comma-separated tags"
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>
            Cancel
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !selectedTypeId}
          >
            {saving ? "Creating..." : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
