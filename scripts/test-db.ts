import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

async function main() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting to database...\n");

  // ─── System Item Types ──────────────────────────────────────
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${itemTypes.length} system item types:\n`);
  for (const type of itemTypes) {
    console.log(`  ${type.icon} ${type.name} (${type.color})`);
  }

  // ─── Demo User ──────────────────────────────────────────────
  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
  });

  console.log("\nDemo user:");
  if (demoUser) {
    console.log(`  Name: ${demoUser.name}`);
    console.log(`  Email: ${demoUser.email}`);
    console.log(`  isPro: ${demoUser.isPro}`);
    console.log(`  Password set: ${!!demoUser.password}`);
    console.log(`  Email verified: ${demoUser.emailVerified}`);
  } else {
    console.log("  NOT FOUND");
  }

  // ─── Collections & Items ────────────────────────────────────
  const collections = await prisma.collection.findMany({
    where: { userId: demoUser?.id },
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  console.log(`\nFound ${collections.length} collections:\n`);
  for (const col of collections) {
    const favLabel = col.isFavorite ? " ★" : "";
    console.log(`  📁 ${col.name}${favLabel} — ${col.description}`);
    for (const ic of col.items) {
      const pinLabel = ic.item.isPinned ? " 📌" : "";
      const favItemLabel = ic.item.isFavorite ? " ★" : "";
      console.log(
        `     └─ [${ic.item.itemType.name}] ${ic.item.title}${pinLabel}${favItemLabel}`
      );
    }
  }

  // ─── Counts ─────────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    items: await prisma.item.count(),
    collections: await prisma.collection.count(),
    tags: await prisma.tag.count(),
  };

  console.log("\nTable counts:");
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table}: ${count}`);
  }

  console.log("\nDatabase connection successful!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Database connection failed:", e);
  process.exit(1);
});
