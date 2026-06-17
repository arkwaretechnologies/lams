import { requireProfile } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SyncProvider } from "@/components/providers/sync-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <SyncProvider>
      <DashboardShell
        permissions={profile.permissions}
        roleSlug={profile.role.slug}
        roleName={profile.role.name}
        userName={profile.full_name}
      >
        {children}
      </DashboardShell>
    </SyncProvider>
  );
}
