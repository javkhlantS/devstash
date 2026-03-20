"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { updateItem as updateItemQuery } from "@/lib/db/items";

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().nullable(),
  content: z.string().nullable(),
  url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  language: z.string().trim().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export async function updateItem(
  itemId: string,
  data: UpdateItemInput
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false as const, error: "Not authenticated" };
    }

    const parsed = updateItemSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false as const,
        error: parsed.error.flatten().fieldErrors,
      };
    }

    // Normalize empty strings to null
    const normalized = {
      ...parsed.data,
      description: parsed.data.description || null,
      content: parsed.data.content || null,
      url: parsed.data.url || null,
      language: parsed.data.language || null,
    };

    const updated = await updateItemQuery(itemId, session.user.id, normalized);
    if (!updated) {
      return { success: false as const, error: "Item not found" };
    }

    return { success: true as const, data: updated };
  } catch {
    return { success: false as const, error: "Failed to update item" };
  }
}
