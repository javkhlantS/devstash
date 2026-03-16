"use client";

import { Search, Plus, Box, PanelLeft, FolderPlus, FilePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "./SidebarContext";

export function TopBar() {
  const { toggle } = useSidebar();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Box className="size-5 text-primary" />
          <span className="text-lg font-semibold">DevStash</span>
        </div>
      </div>
      <div className="mx-4 hidden w-full max-w-md sm:block">
        <div className="relative">
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
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
          <Plus data-icon="inline-start" />
          New Collection
        </Button>
        <Button size="sm" className="hidden sm:inline-flex">
          <Plus data-icon="inline-start" />
          New Item
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="sm" aria-label="Create new" className="sm:hidden" />}
          >
            <Plus />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuItem>
              <FolderPlus />
              New Collection
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FilePlus />
              New Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
