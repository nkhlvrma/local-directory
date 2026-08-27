"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  BarChart3,
  MessageSquareText,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/pending", label: "Pending", icon: Inbox },
  { href: "/admin/leads", label: "Leads", icon: BarChart3 },
  { href: "/admin/outreach", label: "Outreach", icon: MessageSquareText },
  { href: "/admin/categories", label: "Setup", icon: SlidersHorizontal },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return (
    <nav className="md:hidden sticky bottom-0 z-40 border-t bg-background">
      <div className="grid grid-cols-5">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active =
            pathname === n.href ||
            (n.href !== "/admin" && pathname.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 gap-1 text-[10px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              {n.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
