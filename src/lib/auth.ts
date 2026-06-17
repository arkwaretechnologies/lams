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

export async function getProfileWithRole(): Promise<ProfileWithRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*, roles(*)")
    .eq("id", user.id)
    .single();

  if (!data || !data.status) return null;

  const role = data.roles as unknown as Role;
  const permissions = (user.app_metadata?.permissions as string[] | undefined) ?? [];

  return {
    id: data.id,
    full_name: data.full_name,
    email: data.email,
    role_id: data.role_id,
    status: data.status,
    created_at: data.created_at,
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
