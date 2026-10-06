"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, initials } from "@/lib/utils";

const TEAM = [
  { name: "Andrea Cruz", email: "admin@pharmacare.ph", role: "Administrator", status: "Active" },
  { name: "Mark Villareal", email: "mark@pharmacare.ph", role: "Pharmacist", status: "Active" },
  { name: "Joy Fernandez", email: "joy@pharmacare.ph", role: "Cashier", status: "Active" },
  { name: "Paolo Garcia", email: "paolo@pharmacare.ph", role: "Inventory Clerk", status: "Active" },
  { name: "Liza Mercado", email: "liza@pharmacare.ph", role: "Accounting", status: "Invited" },
];

export function SettingsView({
  businessName,
  branch,
  user,
}: {
  businessName: string;
  branch: string;
  user: { name: string; email: string; role: string };
}) {
  const save = (what: string) => toast.success(`${what} saved`, { description: "Settings are stored in mock mode for now." });

  return (
    <Tabs defaultValue="business">
      <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="profile">My profile</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>

      <TabsContent value="business">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Business information</CardTitle>
              <CardDescription>Shown on invoices, receipts and reports.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Business name" defaultValue={businessName} />
            <Field label="Branch" defaultValue={branch} />
            <Field label="FDA License to Operate (LTO) No." defaultValue="LTO-3000002345678" />
            <Field label="TIN" defaultValue="123-456-789-000" />
            <Field label="Phone" defaultValue="(032) 412 3456" />
            <Field label="Email" defaultValue="hello@pharmacare.ph" />
            <Field label="Address" defaultValue="88 Gen. Maxilom Ave., Cebu City, 6000" className="sm:col-span-2" />
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Select defaultValue="PHP">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP">PHP — Philippine Peso (₱)</SelectItem>
                  <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Default credit terms (days)" defaultValue="30" type="number" />
          </CardContent>
          <CardFooter className="justify-end border-t pt-5">
            <Button onClick={() => save("Business information")}>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>My profile</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm text-muted-foreground">{user.role}</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" defaultValue={user.name} />
              <Field label="Email" defaultValue={user.email} type="email" />
              <Field label="New password" type="password" placeholder="••••••••" />
              <Field label="Confirm password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter className="justify-end border-t pt-5">
            <Button onClick={() => save("Profile")}>Update profile</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <AppearanceCard />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Alerts &amp; notifications</CardTitle>
              <CardDescription>Choose what PharmaCare should notify you about.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="divide-y">
            <Toggle title="Low stock alerts" description="When a product reaches its reorder level." defaultChecked />
            <Toggle title="Expiry warnings" description="90 days before a product's expiry date." defaultChecked />
            <Toggle title="Overdue invoices" description="Daily summary of invoices past their due date." defaultChecked />
            <Toggle title="Payment received" description="Every time a payment is posted." />
            <Toggle title="Daily sales report by email" description="Sent at 9:00 PM to the store administrator." />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="team">
        <Card className="gap-0 pb-0">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Team members</CardTitle>
              <CardDescription>People who can sign in to this branch.</CardDescription>
            </div>
            <Button size="sm" onClick={() => toast("Invite sent (demo)")}>
              Invite member
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TEAM.map((m) => (
                <TableRow key={m.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell>
                    <Badge variant={m.status === "Active" ? "success" : "warning"}>{m.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function Field({
  label,
  className,
  ...props
}: { label: string; className?: string } & React.ComponentProps<typeof Input>) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

function Toggle({ title, description, defaultChecked }: { title: string; description: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <Switch defaultChecked={defaultChecked} aria-label={title} />
    </div>
  );
}

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Switch between light and dark mode.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-3 sm:max-w-md">
        {options.map(({ value, label, icon: Icon }) => {
          const active = mounted && theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors hover:bg-accent",
                active && "border-primary bg-primary/5 text-primary ring-1 ring-primary",
              )}
              aria-pressed={active}
            >
              <Icon className="size-5" />
              {label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
