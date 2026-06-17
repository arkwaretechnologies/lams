import { createAdminClient } from "@/lib/supabase/admin";
import type { PermissionKey } from "@/lib/permissions";
import { ALL_PERMISSION_KEYS } from "@/lib/permissions";

export interface RoleWithPermissions {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
}

export async function getRoleWithPermissions(
  roleId: string
): Promise<RoleWithPermissions | null> {
  const admin = createAdminClient();
  const { data: role } = await admin
    .from("roles")
    .select("*")
    .eq("id", roleId)
    .single();

  if (!role) return null;

  const { data: perms } = await admin
    .from("role_permissions")
    .select("permission")
    .eq("role_id", roleId);

  return {
    ...role,
    permissions: perms?.map((p) => p.permission) ?? [],
  };
}

export function buildAppMetadata(role: RoleWithPermissions) {
  return {
    role_id: role.id,
    role_slug: role.slug,
    permissions:
      role.slug === "administrator"
        ? ALL_PERMISSION_KEYS
        : role.permissions,
  };
}

export async function syncUserAppMetadata(userId: string, roleId: string) {
  const role = await getRoleWithPermissions(roleId);
  if (!role) throw new Error("Role not found");

  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, {
    app_metadata: buildAppMetadata(role),
  });
}

export async function syncAllUsersForRole(roleId: string) {
  const admin = createAdminClient();
  const role = await getRoleWithPermissions(roleId);
  if (!role) return;

  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .eq("role_id", roleId);

  for (const profile of profiles ?? []) {
    await admin.auth.admin.updateUserById(profile.id, {
      app_metadata: buildAppMetadata(role),
    });
  }
}

export type { PermissionKey };
