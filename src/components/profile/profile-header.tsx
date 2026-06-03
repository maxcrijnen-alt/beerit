import { CircleUserRound } from "lucide-react";
import type { Profile } from "@/types/database";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
        <CircleUserRound className="size-8" />
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            @{profile.username}
          </h1>
          {profile.role === "ADMIN" ? <Badge>Admin</Badge> : null}
        </div>
        <p className="text-sm leading-5 text-muted-foreground">
          {profile.bio || "Ready to create the next party-game favorite."}
        </p>
      </div>
    </div>
  );
}
