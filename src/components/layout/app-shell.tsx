"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar, SidebarNav, type NavBadges } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationsMenu } from "./notifications-menu";
import { UserMenu } from "./user-menu";
import type { AppNotification } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  badges: NavBadges;
  branch: string;
  asOfDate: string;
  user: { name: string; email: string; role: string };
  notifications: AppNotification[];
}

export function AppShell({ children, badges, branch, asOfDate, user, notifications }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <div className="min-h-dvh">
      <Sidebar badges={badges} branch={branch} />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle>Navigation</SheetTitle>
          <SidebarNav badges={badges} branch={branch} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/70 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <form onSubmit={onSearch} className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, SKUs…"
              className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-14 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
              aria-label="Search products"
            />
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:block">
              Enter
            </kbd>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <div className="mr-2 hidden items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground xl:flex">
              <CalendarDays className="size-3.5" />
              {formatDate(asOfDate, "long")}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Search"
              onClick={() => router.push("/products")}
            >
              <Search className="size-[18px]" />
            </Button>
            <ThemeToggle />
            <NotificationsMenu initial={notifications} />
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <UserMenu user={user} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
