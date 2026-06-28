"use client";

import { useRef } from "react";
import { useCurrentUser } from "@/lib/auth";
import { useUploadMyAvatar, useDeleteMyAvatar } from "@/lib/users-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FiUser } from "react-icons/fi";

export default function ProfileSettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadMyAvatar();
  const deleteAvatar = useDeleteMyAvatar();

  if (isLoading) return <p className="text-on-surface-medium">Loading…</p>;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-outline p-4 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-on-surface">Profile Photo</h2>
          <p className="text-sm text-on-surface-medium mt-0.5">
            Your personal avatar shown next to your name throughout the app.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="h-16 w-16 rounded-full object-cover border border-outline"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-surface-high border border-outline flex items-center justify-center">
              <FiUser className="h-7 w-7 text-on-surface-low" />
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  uploadAvatar.mutate(file, {
                    onSuccess: () => toast.success("Avatar updated."),
                    onError: () => toast.error("Upload failed. Try again."),
                  });
                  e.target.value = "";
                }
              }}
            />
            <Button
              variant="outline"
              disabled={uploadAvatar.isPending || deleteAvatar.isPending}
              onClick={() => avatarInputRef.current?.click()}
            >
              {uploadAvatar.isPending ? "Uploading…" : user.avatar_url ? "Change Photo" : "Upload Photo"}
            </Button>
            {user.avatar_url && (
              <Button
                variant="ghost"
                disabled={uploadAvatar.isPending || deleteAvatar.isPending}
                onClick={() => deleteAvatar.mutate(undefined, {
                  onSuccess: () => toast.success("Avatar removed."),
                  onError: () => toast.error("Failed to remove avatar. Try again."),
                })}
              >
                {deleteAvatar.isPending ? "Removing…" : "Remove"}
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-outline p-4 space-y-2">
        <h2 className="text-base font-semibold text-on-surface">Account Details</h2>
        <div className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <span className="text-on-surface-medium">Name</span>
          <span className="text-on-surface">{user.name}</span>
          <span className="text-on-surface-medium">Email</span>
          <span className="text-on-surface">{user.email}</span>
          <span className="text-on-surface-medium">Role</span>
          <span className="text-on-surface capitalize">{user.role}</span>
        </div>
      </section>
    </div>
  );
}
