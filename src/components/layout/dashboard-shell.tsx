"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";

type DashboardShellProps = {
  permissions: string[];
  roleSlug: string;
  roleName: string;
  userName: string;
  children: React.ReactNode;
};

function DashboardShellSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden" aria-hidden="true">
      <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-sidebar">
        <div className="border-b border-sidebar-border p-4">
          <div className="h-5 w-16 rounded bg-sidebar-accent/40" />
          <div className="mt-2 h-3 w-28 rounded bg-sidebar-accent/30" />
        </div>
        <div className="flex-1 space-y-2 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-sidebar-accent/30" />
          ))}
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="h-14 border-b bg-background" />
        <div className="flex-1 bg-muted/20" />
      </main>
    </div>
  );
}

export function DashboardShell({
  permissions,
  roleSlug,
  roleName,
  userName,
  children,
}: DashboardShellProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <DashboardShellSkeleton />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar
        permissions={permissions}
        roleSlug={roleSlug}
        roleName={roleName}
        userName={userName}
      />
      <main className="lams-surface flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
