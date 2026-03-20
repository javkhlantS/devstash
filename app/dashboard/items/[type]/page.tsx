import { notFound } from "next/navigation";
import { ItemListWithDrawer } from "@/components/items/ItemListWithDrawer";
import { getItemsByType } from "@/lib/db/items";

const VALID_TYPES: Record<string, string> = {
  snippets: "Snippet",
  prompts: "Prompt",
  commands: "Command",
  notes: "Note",
  files: "File",
  images: "Image",
  links: "Link",
};

interface ItemsPageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsPage({ params }: ItemsPageProps) {
  const { type: slug } = await params;
  const typeName = VALID_TYPES[slug];

  if (!typeName) {
    notFound();
  }

  const items = await getItemsByType(typeName);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{typeName}s</h1>
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-card py-16 ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">
            No {typeName.toLowerCase()}s yet
          </p>
        </div>
      ) : (
        <ItemListWithDrawer items={items} />
      )}
    </div>
  );
}
