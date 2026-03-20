import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getItemTypesWithCounts,
  getSidebarCollections,
  getItemTypes,
} from "@/lib/db/items";
import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const [itemTypes, collections, allItemTypes] = await Promise.all([
    getItemTypesWithCounts(),
    getSidebarCollections(),
    getItemTypes(),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col">
          <TopBar itemTypes={allItemTypes} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              itemTypes={itemTypes}
              collections={collections}
              user={{
                name: session?.user?.name || "User",
                email: session?.user?.email || "",
                image: session?.user?.image ?? null,
              }}
            />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
