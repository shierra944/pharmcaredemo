"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, TrendingUp, Boxes, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo, LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DEMO_USER, signIn } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    if (email.trim().toLowerCase() !== DEMO_USER.email || password !== DEMO_USER.password) {
      setLoading(false);
      setError("Invalid email or password. Use the demo credentials below.");
      return;
    }
    signIn();
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next && next.startsWith("/") ? next : "/dashboard");
    router.refresh();
  }

  function fillDemo() {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setError(null);
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 p-10 text-white lg:flex lg:flex-col">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
        <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-emerald-400/20 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-16 size-96 rounded-full bg-sky-300/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <LogoMark className="bg-white/15 from-white/20 to-white/5 ring-1 ring-white/25" />
          <span className="text-lg font-bold tracking-tight">PharmaCare</span>
        </div>

        <div className="relative mt-auto max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Run your pharmacy with clarity, not spreadsheets.
          </h1>
          <p className="mt-4 text-blue-100">
            Track stock and expiry dates, record sales, follow up receivables and see what&apos;s selling — all in one
            place built for drugstores and supplement shops.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              { icon: TrendingUp, label: "Live sales", value: "+18%" },
              { icon: Boxes, label: "SKUs tracked", value: "1,200+" },
              { icon: Receipt, label: "Invoices", value: "Auto" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <Icon className="size-5 text-emerald-300" />
                <div className="mt-3 text-xl font-semibold">{value}</div>
                <div className="text-xs text-blue-100">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-10 flex items-center gap-2 text-sm text-blue-100">
          <ShieldCheck className="size-4 text-emerald-300" />
          FDA-compliant record keeping · Encrypted at rest
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" subtitle={false} />
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your PharmaCare account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@pharmacy.ph"
                  className="h-10 pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 px-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : null}
              {loading ? "Signing in…" : "Login"}
              {!loading && <ArrowRight />}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed bg-muted/40 p-4 text-sm">
            <div className="font-medium">Demo account</div>
            <div className="mt-1 text-muted-foreground">
              {DEMO_USER.email} · {DEMO_USER.password}
            </div>
            <button type="button" onClick={fillDemo} className="mt-2 text-xs font-semibold text-primary hover:underline">
              Fill in demo credentials
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">© 2026 PharmaCare. All rights reserved.</p>
      </main>
    </div>
  );
}
