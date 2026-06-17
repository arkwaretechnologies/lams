import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { UsersClient } from "@/components/users/users-client";

export default async function UsersPage() {
  await requirePermission("users");
  const supabase = await createClient();

  const [{ data: users }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, roles(id, name, slug)")
      .order("created_at", { ascending: false }),
    supabase.from("roles").select("id, name, slug").order("name"),
  ]);

  return (
    <UsersClient
      users={(users ?? []).map((u) => ({
        ...u,
        role_name: (u.roles as unknown as { name: string } | null)?.name ?? "Unknown",
      }))}
      roles={roles ?? []}
    />
  );
}
