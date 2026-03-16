"use client";

import { Search, Plus, Box } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Box className="size-5 text-primary" />
          <span className="text-lg font-semibold">DevStash</span>
        </div>
        <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search items..."
          className="pl-9 pr-14"
          readOnly
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          ⌘K
        </kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Plus data-icon="inline-start" />
          New Collection
        </Button>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New Item
        </Button>
      </div>
    </header>
  );
}
