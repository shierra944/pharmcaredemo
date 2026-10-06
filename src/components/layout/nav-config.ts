import {
  BarChart3,
  Boxes,
  CreditCard,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavBadgeKey = "lowStock" | "overdue" | "unpaidOrders";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: NavBadgeKey;
}

export const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/products", icon: Package, badge: "lowStock" },
      { title: "Inventory", href: "/inventory", icon: Boxes },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", href: "/orders", icon: ShoppingCart },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Payments", href: "/payments", icon: CreditCard, badge: "overdue" },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);
