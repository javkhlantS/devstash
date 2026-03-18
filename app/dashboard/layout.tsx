import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getItemTypesWithCounts, getSidebarCollections } from "@/lib/db/items";
import { prisma } from "@/lib/db";

// TODO: Replace with authenticated user once auth is wired up
const DEMO_USER_EMAIL = "demo@devstash.io";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [itemTypes, collections, user] = await Promise.all([
    getItemTypesWithCounts(),
    getSidebarCollections(),
    prisma.user.findUniqueOrThrow({
      where: { email: DEMO_USER_EMAIL },
      select: { name: true, email: true },
    }),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen flex-col">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              itemTypes={itemTypes}
              collections={collections}
              user={{ name: user.name || "User", email: user.email }}
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
