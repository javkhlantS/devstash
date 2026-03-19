"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountButton() {
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/auth/delete-account", {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setIsLoading(false);
      return;
    }

    await signOut({ callbackUrl: "/sign-in" });
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All your items,
            collections, and data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Type <span className="font-semibold">delete my account</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="delete my account"
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary">Cancel</Button>} />
          <Button
            variant="destructive"
            disabled={confirmation !== "delete my account" || isLoading}
            onClick={handleDelete}
          >
            {isLoading ? "Deleting…" : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
