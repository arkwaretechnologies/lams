import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPermission, type PermissionKey } from "@/lib/permissions";
import type { Tables } from "@/types/database";

export type Profile = Tables<"profiles">;
export type Role = Tables<"roles">;

export type ProfileWithRole = Profile & {
  role: Role;
  permissions: string[];
};

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function roleFromAppMetadata(
  user: { app_metadata?: Record<string, unknown> },
  fallbackCreatedAt: string
): Role | null {
  const meta = user.app_metadata ?? {};
  const roleId = meta.role_id as string | undefined;
  const roleSlug = meta.role_slug as string | undefined;
  if (!roleId || !roleSlug) return null;

  return {
    id: roleId,
    slug: roleSlug,
    name: roleSlug === "administrator" ? "Administrator" : roleSlug,
    description: null,
    is_system: roleSlug === "administrator",
    created_at: fallbackCreatedAt,
  };
}

export async function getProfileWithRole(): Promise<ProfileWithRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.status) return null;

  const { data: roleData } = await supabase
    .from("roles")
    .select("*")
    .eq("id", profile.role_id)
    .single();

  const role = roleData ?? roleFromAppMetadata(user, profile.created_at);
  if (!role) return null;

  const permissions = (user.app_metadata?.permissions as string[] | undefined) ?? [];

  return {
    ...profile,
    role,
    permissions,
  };
}

export async function getProfile(): Promise<Profile | null> {
  const full = await getProfileWithRole();
  if (!full) return null;
  const { role: _role, permissions: _perms, ...profile } = full;
  return profile;
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requireProfile() {
  const profile = await getProfileWithRole();
  if (!profile) redirect("/login");
  return profile;
}

export async function requirePermission(permission: PermissionKey) {
  const profile = await requireProfile();
  if (!hasPermission(profile.permissions, permission, profile.role.slug)) {
    redirect("/");
  }
  return profile;
}

/** @deprecated Use requirePermission('users') */
export async function requireAdmin() {
  return requirePermission("users");
}

export function getPermissionsFromUser(
  user: { app_metadata?: Record<string, unknown> } | null
): string[] {
  return (user?.app_metadata?.permissions as string[] | undefined) ?? [];
}
