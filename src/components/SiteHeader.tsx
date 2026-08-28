"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const SITE_NAME = "Local Directory";

// Transparent (no background/border/blur) only on the homepage, where it
// sits directly on top of the hero image — every other page keeps the
// solid sticky header so it reads clearly over regular page content.
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        isHome ? "text-white" : "border-b bg-background/95 backdrop-blur-sm",
      )}
    >
      <Container className="py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center shrink-0">
            <span className="font-bold text-base tracking-tight">{SITE_NAME}</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          <Link href="/list-your-business">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">List your business</span>
              <span className="sm:hidden">List</span>
            </Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
