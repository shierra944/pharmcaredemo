"use client";

import { useState } from "react";
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const ICONS = {
  info: { icon: Info, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  success: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  danger: { icon: XCircle, className: "bg-red-500/10 text-red-600 dark:text-red-400" },
} as const;

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function NotificationsMenu({ initial }: { initial: AppNotification[] }) {
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unread} unread)`}>
          <Bell className="size-[18px]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-card">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-semibold">Notifications</div>
            <div className="text-xs text-muted-foreground">{unread} unread</div>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
            disabled={unread === 0}
            onClick={() => setItems((all) => all.map((n) => ({ ...n, read: true })))}
          >
            Mark all as read
          </button>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-96 overflow-y-auto p-1">
          {items.map((n) => {
            const cfg = ICONS[(n.type as keyof typeof ICONS) ?? "info"] ?? ICONS.info;
            const Icon = cfg.icon;
            return (
              <DropdownMenuItem
                key={n.id}
                className="items-start gap-3 p-3"
                onSelect={(e) => {
                  e.preventDefault();
                  setItems((all) => all.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                }}
              >
                <span className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full", cfg.className)}>
                  <Icon className="!size-4 !text-current" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{n.title}</span>
                    {!n.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                  </span>
                  <span className="mt-0.5 block whitespace-normal text-xs text-muted-foreground">{n.message}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground/80">{timeLabel(n.time)}</span>
                </span>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
