import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserProfile, getUserStats } from "@/lib/db/users";
import { UserAvatar } from "@/components/layout/UserAvatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Github,
  Mail,
  Calendar,
  Package,
  FolderOpen,
} from "lucide-react";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { DeleteAccountButton } from "./DeleteAccountButton";

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

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [profile, stats] = await Promise.all([
    getUserProfile(session.user.id),
    getUserStats(session.user.id),
  ]);

  const joinDate = profile.createdAt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isOAuthUser = profile.providers.includes("github");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      {/* User Info */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <UserAvatar
            name={profile.name}
            image={profile.image}
            size="lg"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">
              {profile.name || "User"}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="size-3.5" />
              {profile.email}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              Joined {joinDate}
            </div>
            {isOAuthUser && (
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Github className="size-3.5" />
                Connected via GitHub
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">{stats.totalItems}</span> items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4 text-muted-foreground" />
              <span className="text-sm">
                <span className="font-semibold">{stats.totalCollections}</span>{" "}
                collections
              </span>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.itemsByType.map((type) => {
              const Icon = iconMap[type.icon];
              return (
                <div
                  key={type.name}
                  className="flex items-center gap-2 text-sm"
                >
                  {Icon && (
                    <Icon
                      className="size-4"
                      style={{ color: type.color }}
                    />
                  )}
                  <span className="text-muted-foreground">{type.name}</span>
                  <span className="font-medium">{type.count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Change Password (email users only) */}
      {profile.hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
