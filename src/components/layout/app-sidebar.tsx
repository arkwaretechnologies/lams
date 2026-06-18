"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  CreditCard,
  FileText,
  Radio,
  Upload,
  History,
  LogOut,
  Shield,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { hasPermission, type PermissionKey } from "@/lib/permissions";

const NAV_GROUPS: {
  label: string;
  items: {
    href: string;
    label: string;
    permissionKey: PermissionKey;
    icon: LucideIcon;
  }[];
}[] = [
  {
    label: "Operations",
    items: [
      { href: "/", label: "Dashboard", permissionKey: "dashboard", icon: LayoutDashboard },
      { href: "/consumption", label: "Consumption", permissionKey: "consumption", icon: UtensilsCrossed },
      { href: "/transactions", label: "Transactions", permissionKey: "transactions", icon: History },
      { href: "/reports", label: "Reports", permissionKey: "reports", icon: FileText },
    ],
  },
  {
    label: "Athletes",
    items: [
      { href: "/athletes", label: "Athletes", permissionKey: "athletes", icon: Users },
      { href: "/athletes/import", label: "Import Athletes", permissionKey: "athletes_import", icon: Upload },
      { href: "/rfid", label: "RFID Assignment", permissionKey: "rfid", icon: Radio },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/users", label: "Users", permissionKey: "users", icon: CreditCard },
      { href: "/roles", label: "Roles", permissionKey: "roles", icon: Shield },
      {
        href: "/remark-templates",
        label: "Remark Templates",
        permissionKey: "remark_templates",
        icon: ClipboardList,
      },
    ],
  },
];

interface AppSidebarProps {
  permissions: PermissionKey[] | string[];
  roleSlug: string;
  roleName: string;
  userName: string;
}

export function AppSidebar({ permissions, roleSlug, roleName, userName }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="lams-sidebar flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border text-sidebar-foreground">
      <div className="h-0.5 shrink-0 bg-accent" aria-hidden="true" />

      <div className="shrink-0 px-5 py-5">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/lams-mark.svg"
            alt="LAMS"
            width={40}
            height={40}
            className="shrink-0"
          />
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold tracking-tight text-sidebar-primary">
              LAMS
            </h1>
            <p className="truncate text-xs text-sidebar-foreground/65">Letran Athlete Meals</p>
          </div>
        </div>
      </div>

      <nav className="lams-sidebar-nav min-h-0 flex-1 px-4 py-2">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasPermission(permissions, item.permissionKey, roleSlug)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-2.5 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/40">
                {group.label}
              </p>
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "lams-nav-link",
                          active && "lams-nav-link--active"
                        )}
                      >
                        <Icon className="lams-nav-icon" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 p-4">
        <div className="lams-sidebar-glass p-3.5">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="mt-0.5 text-xs font-medium text-accent">{roleName}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-full border-white/15 bg-white/5 text-sidebar-foreground backdrop-blur-sm hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
