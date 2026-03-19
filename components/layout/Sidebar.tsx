"use client";

import Link from "next/link";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  ChevronDown,
  Star,
  FolderOpen,
  LogOut,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "./UserAvatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "./SidebarContext";
import type { SidebarItemType, SidebarCollection } from "@/lib/db/items";

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

interface SidebarProps {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image: string | null };
}

export function Sidebar({ itemTypes, collections, user }: SidebarProps) {
  const { isOpen, close } = useSidebar();

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections
    .filter((c) => !c.isFavorite)
    .slice(0, 5);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-4 pt-3 md:hidden">
        <span className="text-sm font-medium text-muted-foreground">Menu</span>
        <Button variant="ghost" size="icon-xs" onClick={close}>
          <X className="size-4" />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Types section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground [&[data-panel-open]>svg]:rotate-0">
            <ChevronDown className="size-3.5 -rotate-90 transition-transform" />
            Types
          </CollapsibleTrigger>
          <CollapsibleContent>
            <nav className="mt-0.5 space-y-0.5">
              {itemTypes.map((type) => {
                const Icon = iconMap[type.icon];
                const slug = type.name.toLowerCase() + "s";

                return (
                  <Tooltip key={type.id}>
                    <TooltipTrigger render={<Link href={`/dashboard/items/${slug}`} />}>
                      <span className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <span className="flex items-center gap-2.5">
                          {Icon && (
                            <Icon
                              className="size-4"
                              style={{ color: type.color }}
                            />
                          )}
                          {type.name}s
                          {(type.name === "File" || type.name === "Image") && (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold tracking-wide">
                              PRO
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {type._count.items}
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Browse {type.name.toLowerCase()}s
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </CollapsibleContent>
        </Collapsible>

        <Separator className="my-3" />

        {/* Collections section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground [&[data-panel-open]>svg]:rotate-0">
            <ChevronDown className="size-3.5 -rotate-90 transition-transform" />
            Collections
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-0.5">
              {/* Favorites */}
              {favoriteCollections.length > 0 && (
                <div className="mb-2">
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Favorites
                  </span>
                  <nav className="mt-1 space-y-0.5">
                    {favoriteCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <FolderOpen className="size-4 shrink-0 text-muted-foreground/60" />
                          <span className="truncate">{col.name}</span>
                        </span>
                        <Star className="size-3 shrink-0 fill-yellow-500 text-yellow-500" />
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Recent collections */}
              {recentCollections.length > 0 && (
                <div>
                  <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    Recent
                  </span>
                  <nav className="mt-1 space-y-0.5">
                    {recentCollections.map((col) => (
                      <Link
                        key={col.id}
                        href={`/collections/${col.id}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                col.dominantColor || "var(--muted-foreground)",
                            }}
                          />
                          <span className="truncate">{col.name}</span>
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {col.itemCount}
                        </span>
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* View all collections */}
              <Link
                href="/collections"
                className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                View all collections
              </Link>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* User area */}
      <Separator />
      <div className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-muted" />
            }
          >
            <UserAvatar name={user.name} image={user.image} size="sm" />
            <div className="flex min-w-0 flex-col text-left">
              <span className="truncate text-sm font-medium leading-tight">
                {user.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem
              render={<a href="/dashboard/profile" />}
            >
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-border bg-sidebar transition-[width] duration-200 md:flex",
          isOpen ? "w-60" : "w-0 overflow-hidden border-r-0"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300 md:hidden",
          isOpen
            ? "visible opacity-100"
            : "invisible opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={close}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-64 bg-sidebar transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </div>
    </>
  );
}
