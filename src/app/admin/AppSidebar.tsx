"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Flag,
  Tags,
  MapPin,
  Plus,
  LogOut,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

const NAV = [
  { href: "/admin", label: "Pending queue", icon: Inbox },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/neighborhoods", label: "Neighborhoods", icon: MapPin },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <ShieldCheck className="size-5 text-primary shrink-0" />
          <span className="font-semibold text-sm group-data-[collapsible=icon]:hidden">
            Admin
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Review</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button asChild size="sm" className="w-full justify-start gap-1.5 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
                  <Link href="/admin/listings/new">
                    <Plus className="size-4 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      New listing
                    </span>
                  </Link>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Sends a recovery link by email rather than changing the password
            inline. An inline change from an already-open session would let
            anyone who found an unattended dashboard lock out the real
            admin; requiring the emailed link keeps possession of the
            mailbox as the thing that proves it's you. */}
        <SidebarMenuButton asChild tooltip="Reset password">
          <Link href="/admin/forgot-password">
            <KeyRound />
            <span>Reset password</span>
          </Link>
        </SidebarMenuButton>
        <form action={signOut}>
          <SidebarMenuButton type="submit" tooltip="Sign out">
            <LogOut />
            <span>Sign out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
