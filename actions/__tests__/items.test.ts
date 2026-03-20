import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";

const { mockAuth, mockUpdateItemQuery, mockDeleteItemQuery, mockCreateItemQuery } = vi.hoisted(() => ({
  mockAuth: vi.fn<() => Promise<Session | null>>(),
  mockUpdateItemQuery: vi.fn(),
  mockDeleteItemQuery: vi.fn(),
  mockCreateItemQuery: vi.fn(),
}));

vi.mock("@/auth", () => ({
  auth: mockAuth,
}));

vi.mock("@/lib/db/items", () => ({
  updateItem: mockUpdateItemQuery,
  deleteItem: mockDeleteItemQuery,
  createItem: mockCreateItemQuery,
}));

import { updateItem, deleteItem, createItem } from "@/actions/items";

const validInput = {
  title: "Test Item",
  description: "A description",
  content: "some content",
  url: null,
  language: "javascript",
  tags: ["react", "hooks"],
};

const mockItemDetail = {
  id: "item-1",
  title: "Test Item",
  description: "A description",
  contentType: "text",
  content: "some content",
  url: null,
  fileUrl: null,
  fileName: null,
  fileSize: null,
  language: "javascript",
  isFavorite: false,
  isPinned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  itemType: { name: "Snippet", icon: "Code", color: "#3b82f6" },
  tags: [
    { tag: { id: "t1", name: "react" } },
    { tag: { id: "t2", name: "hooks" } },
  ],
  collections: [],
};

describe("updateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockUpdateItemQuery).not.toHaveBeenCalled();
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "" }, expires: "" } as Session);

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("returns validation errors for empty title", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });

    const result = await updateItem("item-1", {
      ...validInput,
      title: "",
    });

    expect(result.success).toBe(false);
    expect(result.error).toHaveProperty("title");
  });

  it("returns validation errors for invalid URL", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });

    const result = await updateItem("item-1", {
      ...validInput,
      url: "not-a-url",
    });

    expect(result.success).toBe(false);
    expect(result.error).toHaveProperty("url");
  });

  it("allows empty string URL (normalized to null)", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockUpdateItemQuery.mockResolvedValue(mockItemDetail);

    const result = await updateItem("item-1", {
      ...validInput,
      url: "",
    });

    expect(result.success).toBe(true);
    expect(mockUpdateItemQuery).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({ url: null })
    );
  });

  it("normalizes empty strings to null", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockUpdateItemQuery.mockResolvedValue(mockItemDetail);

    await updateItem("item-1", {
      ...validInput,
      description: "",
      content: "",
      language: "",
    });

    expect(mockUpdateItemQuery).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({
        description: null,
        content: null,
        language: null,
      })
    );
  });

  it("returns item not found when query returns null", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockUpdateItemQuery.mockResolvedValue(null);

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("returns updated item on success", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockUpdateItemQuery.mockResolvedValue(mockItemDetail);

    const result = await updateItem("item-1", validInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("item-1");
      expect(result.data.title).toBe("Test Item");
    }
  });

  it("trims title and description whitespace", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockUpdateItemQuery.mockResolvedValue(mockItemDetail);

    await updateItem("item-1", {
      ...validInput,
      title: "  Padded Title  ",
      description: "  Padded Desc  ",
    });

    expect(mockUpdateItemQuery).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({
        title: "Padded Title",
        description: "Padded Desc",
      })
    );
  });

  it("handles unexpected errors gracefully", async () => {
    mockAuth.mockRejectedValue(new Error("DB down"));

    const result = await updateItem("item-1", validInput);

    expect(result).toEqual({
      success: false,
      error: "Failed to update item",
    });
  });
});

// ─── deleteItem ──────────────────────────────────────────────

describe("deleteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockDeleteItemQuery).not.toHaveBeenCalled();
  });

  it("returns error when session has no user id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "" }, expires: "" } as Session);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("returns error when item not found", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockDeleteItemQuery.mockResolvedValue(false);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("returns success when item deleted", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockDeleteItemQuery.mockResolvedValue(true);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteItemQuery).toHaveBeenCalledWith("item-1", "user-1");
  });

  it("handles unexpected errors gracefully", async () => {
    mockAuth.mockRejectedValue(new Error("DB down"));

    const result = await deleteItem("item-1");

    expect(result).toEqual({
      success: false,
      error: "Failed to delete item",
    });
  });
});

// ─── createItem ──────────────────────────────────────────────

const validCreateInput = {
  title: "New Item",
  description: "A description",
  content: "some content",
  url: null,
  language: "javascript",
  itemTypeId: "type-1",
  tags: ["react"],
};

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await createItem(validCreateInput);

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation errors for empty title", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });

    const result = await createItem({ ...validCreateInput, title: "" });

    expect(result.success).toBe(false);
    expect(result.error).toHaveProperty("title");
  });

  it("returns validation errors for empty itemTypeId", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });

    const result = await createItem({ ...validCreateInput, itemTypeId: "" });

    expect(result.success).toBe(false);
    expect(result.error).toHaveProperty("itemTypeId");
  });

  it("returns validation errors for invalid URL", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });

    const result = await createItem({
      ...validCreateInput,
      url: "not-a-url",
    });

    expect(result.success).toBe(false);
    expect(result.error).toHaveProperty("url");
  });

  it("normalizes empty strings to null", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockCreateItemQuery.mockResolvedValue(mockItemDetail);

    await createItem({
      ...validCreateInput,
      description: "",
      content: "",
      language: "",
      url: "",
    });

    expect(mockCreateItemQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        description: null,
        content: null,
        language: null,
        url: null,
      })
    );
  });

  it("returns created item on success", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "user-1" },
      expires: "",
    });
    mockCreateItemQuery.mockResolvedValue(mockItemDetail);

    const result = await createItem(validCreateInput);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("item-1");
    }
  });

  it("handles unexpected errors gracefully", async () => {
    mockAuth.mockRejectedValue(new Error("DB down"));

    const result = await createItem(validCreateInput);

    expect(result).toEqual({
      success: false,
      error: "Failed to create item",
    });
  });
});
