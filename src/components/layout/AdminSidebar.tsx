"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  Zap,
  BarChart2,
  Settings,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/drops", label: "Drops", icon: Zap },
  { href: "/admin/landing-page", label: "Landing Page", icon: PanelLeft },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params.locale as string) ?? "mn";

  return (
    <aside className="w-[200px] shrink-0 border-r border-gray-100 min-h-[calc(100vh-50px)] bg-white">
      <nav className="py-6 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const fullHref = `/${locale}${href}`;
          const isActive =
            href === "/admin"
              ? pathname === fullHref
              : pathname.startsWith(fullHref);

          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 text-[12px] transition-colors",
                isActive
                  ? "bg-black text-white"
                  : "hover:bg-gray-50 text-gray-600 hover:text-black"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
