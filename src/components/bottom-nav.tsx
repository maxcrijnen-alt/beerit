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
    <nav className="fixed inset-x-0 bottom-3 z-20 px-3 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-xl grid-cols-5 rounded-[1.35rem] border border-border/80 bg-background/85 p-1 shadow-[0_18px_48px_rgba(48,34,18,0.16)] backdrop-blur-xl">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== "/home" && pathname.startsWith(href));

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-h-14 touch-manipulation flex-col items-center justify-center gap-1 rounded-[1rem] text-[11px] font-semibold text-muted-foreground transition-[background-color,color,transform] duration-150 active:scale-95",
                active && "bg-primary/10 text-primary",
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
