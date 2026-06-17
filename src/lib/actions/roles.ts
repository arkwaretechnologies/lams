"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/auth";
import {
  buildAppMetadata,
  getRoleWithPermissions,
  syncAllUsersForRole,
  syncUserAppMetadata,
} from "@/lib/roles";
import { ALL_PERMISSION_KEYS, type PermissionKey } from "@/lib/permissions";
import { roleSchema } from "@/lib/validations/schemas";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createRoleAction(formData: {
  name: string;
  description?: string;
  permissions: PermissionKey[];
}) {
  await requirePermission("roles");
  const parsed = roleSchema.parse(formData);
  const supabase = await createClient();
  const slug = slugify(parsed.name);

  const { data: role, error } = await supabase
    .from("roles")
    .insert({
      name: parsed.name,
      slug,
      description: parsed.description ?? null,
      is_system: false,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  if (parsed.permissions.length > 0) {
    const { error: permError } = await supabase.from("role_permissions").insert(
      parsed.permissions.map((permission) => ({
        role_id: role.id,
        permission,
      }))
    );
    if (permError) return { error: permError.message };
  }

  revalidatePath("/roles");
  return { success: true };
}

export async function updateRoleAction(
  id: string,
  formData: {
    name: string;
    description?: string;
    permissions: PermissionKey[];
  }
) {
  await requirePermission("roles");
  const parsed = roleSchema.parse(formData);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("roles")
    .select("is_system, slug")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Role not found" };

  const { error } = await supabase
    .from("roles")
    .update({
      name: parsed.name,
      description: parsed.description ?? null,
      ...(existing.is_system ? {} : { slug: slugify(parsed.name) }),
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("role_permissions").delete().eq("role_id", id);

  const permissions =
    existing.slug === "administrator"
      ? ALL_PERMISSION_KEYS
      : parsed.permissions;

  if (permissions.length > 0) {
    const { error: permError } = await supabase.from("role_permissions").insert(
      permissions.map((permission) => ({ role_id: id, permission }))
    );
    if (permError) return { error: permError.message };
  }

  await syncAllUsersForRole(id);
  revalidatePath("/roles");
  revalidatePath("/users");
  return { success: true, message: "Role updated. Affected users should sign in again." };
}

export async function deleteRoleAction(id: string) {
  await requirePermission("roles");
  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("is_system")
    .eq("id", id)
    .single();

  if (!role) return { error: "Role not found" };
  if (role.is_system) return { error: "System roles cannot be deleted" };

  const { count } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role_id", id);

  if (count && count > 0) {
    return { error: "Cannot delete role assigned to users" };
  }

  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/roles");
  return { success: true };
}

export async function getRolesWithPermissions() {
  const supabase = await createClient();
  const { data: roles } = await supabase.from("roles").select("*").order("name");
  if (!roles) return [];

  const { data: perms } = await supabase.from("role_permissions").select("*");

  return roles.map((role) => ({
    ...role,
    permissions: perms?.filter((p) => p.role_id === role.id).map((p) => p.permission) ?? [],
  }));
}
