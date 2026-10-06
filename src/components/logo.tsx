import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-700 text-white shadow-sm",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <rect x="9" y="3" width="6" height="18" rx="1.5" fill="currentColor" />
        <rect x="3" y="9" width="18" height="6" rx="1.5" fill="currentColor" />
        <circle cx="18.5" cy="5.5" r="2.5" fill="#34d399" />
      </svg>
    </div>
  );
}

export function Logo({ className, subtitle = true }: { className?: string; subtitle?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <div className="leading-tight">
        <div className="text-[15px] font-bold tracking-tight">
          Pharma<span className="text-primary">Care</span>
        </div>
        {subtitle && <div className="text-[11px] font-medium text-muted-foreground">Management Suite</div>}
      </div>
    </div>
  );
}
