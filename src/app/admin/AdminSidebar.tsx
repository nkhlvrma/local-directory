"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  List,
  MessageSquareText,
  BarChart3,
  SlidersHorizontal,
  Upload,
  Download,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, hint: "At a glance" },
  { href: "/admin/pending", label: "New submissions", icon: Inbox, hint: "Approve / reject" },
  { href: "/admin/leads", label: "Leads delivered", icon: BarChart3, hint: "WhatsApp taps" },
  { href: "/admin/outreach", label: "Reach out", icon: MessageSquareText, hint: "Message businesses" },
  { href: "/admin/categories", label: "Categories", icon: SlidersHorizontal, hint: "Custom fields" },
  { href: "/admin/insights", label: "Insights", icon: List, hint: "What people search" },
  { href: "/admin/import", label: "Bulk import", icon: Upload, hint: "Paste rows" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r bg-muted/30 py-4 px-3 gap-1 sticky top-[57px] self-start" style={{ height: "calc(100vh - 57px)" }}>
      <div className="px-2 py-2 mb-1">
        <div className="text-xs font-medium text-muted-foreground">
          Admin
        </div>
      </div>
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
              "flex items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors",
              active && "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="size-4 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <div className="font-medium leading-tight">{n.label}</div>
              <div className="text-xs text-muted-foreground">{n.hint}</div>
            </div>
          </Link>
        );
      })}
      <div className="mt-auto space-y-1">
        <Link
          href="/admin/export?type=listings"
          download
          className="flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
        >
          <Download className="size-4" />
          Export CSV
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="size-3.5" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}
