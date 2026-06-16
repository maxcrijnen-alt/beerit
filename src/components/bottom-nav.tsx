"use client";

import {
  CircleUserRound,
  Gamepad2,
  Home,
  PlusCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  profileHref: string;
}

const items = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/browse", icon: Search, label: "Browse" },
  { href: "/create", icon: PlusCircle, label: "Create" },
  { href: "/lobby", icon: Gamepad2, label: "Lobby" },
] as const;

export function BottomNav({ profileHref }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = [
    ...items,
    { href: profileHref, icon: CircleUserRound, label: "Profile" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur">
      <div className="mx-auto grid max-w-xl grid-cols-5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== "/home" && pathname.startsWith(href));

          return (
            <Link
              className={cn(
                "relative flex min-h-16 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-[color,transform] duration-150 active:scale-95",
                active && "text-primary after:absolute after:bottom-1.5 after:h-1 after:w-6 after:rounded-full after:bg-primary",
              )}
              href={href}
              key={label}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
