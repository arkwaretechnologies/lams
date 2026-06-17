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
    <aside className="relative flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-accent" aria-hidden="true" />

      <div className="border-b border-sidebar-border p-4 pt-5">
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
            <p className="truncate text-xs text-sidebar-foreground/70">Letran Athlete Meals</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasPermission(permissions, item.permissionKey, roleSlug)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/50">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors duration-200",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground lams-gold-rule-left"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg border border-accent/25 bg-sidebar-accent/30 p-3">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="mt-1 inline-flex rounded border border-accent/40 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sidebar-primary">
            {roleName}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent/50"
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
