"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireProfile, requirePermission } from "@/lib/auth";
import { buildAppMetadata, getRoleWithPermissions } from "@/lib/roles";
import { athleteSchema, userSchema } from "@/lib/validations/schemas";

export async function createAthlete(formData: {
  student_id: string;
  full_name: string;
  rfid_tag?: string | null;
}) {
  await requirePermission("athletes");
  const parsed = athleteSchema.parse({ ...formData, status: true });
  const supabase = await createClient();

  const { error } = await supabase.from("athletes").insert({
    student_id: parsed.student_id,
    full_name: parsed.full_name,
    rfid_tag: parsed.rfid_tag || null,
    status: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/athletes");
  return { success: true };
}

export async function updateAthlete(
  id: string,
  formData: {
    student_id: string;
    full_name: string;
    rfid_tag?: string | null;
    status: boolean;
  }
) {
  await requirePermission("athletes");
  const parsed = athleteSchema.parse(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("athletes")
    .update({
      student_id: parsed.student_id,
      full_name: parsed.full_name,
      rfid_tag: parsed.rfid_tag || null,
      status: parsed.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/athletes");
  return { success: true };
}

export async function assignRfid(athleteId: string, rfidTag: string) {
  await requirePermission("rfid");
  const supabase = await createClient();

  const { error } = await supabase
    .from("athletes")
    .update({ rfid_tag: rfidTag })
    .eq("id", athleteId);

  if (error) return { error: error.message };
  revalidatePath("/rfid");
  revalidatePath("/athletes");
  return { success: true };
}

export async function importAthletes(
  rows: { student_id: string; full_name: string }[]
) {
  await requirePermission("athletes_import");
  const supabase = await createClient();
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const { error } = await supabase.from("athletes").insert({
      student_id: row.student_id.trim(),
      full_name: row.full_name.trim(),
      status: true,
    });
    if (error) {
      if (error.code === "23505") skipped++;
      else errors.push(`${row.student_id}: ${error.message}`);
    } else {
      imported++;
    }
  }

  revalidatePath("/athletes");
  return { imported, skipped, errors };
}

export async function recordConsumptionAction(
  athleteId: string,
  amount: number,
  clientId?: string,
  remarks?: string
) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("record_consumption", {
    p_athlete_id: athleteId,
    p_amount: amount,
    p_recorded_by: profile.id,
    p_client_id: clientId ?? undefined,
    p_remarks: remarks?.trim() || undefined,
  });

  if (error) {
    if (error.message.includes("insufficient_balance")) {
      return { error: "Insufficient balance. Cannot exceed PHP 200 daily allowance." };
    }
    return { error: error.message };
  }

  revalidatePath("/consumption");
  revalidatePath("/transactions");
  revalidatePath("/");
  return {
    success: true,
    remaining: data?.[0]?.remaining_balance ?? 0,
  };
}

export async function createUserAction(formData: {
  full_name: string;
  email: string;
  role_id: string;
  password: string;
}) {
  await requirePermission("users");
  const parsed = userSchema.parse({ ...formData, status: true });
  const admin = createAdminClient();

  const role = await getRoleWithPermissions(parsed.role_id);
  if (!role) return { error: "Invalid role" };

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: parsed.email,
    password: parsed.password!,
    email_confirm: true,
    app_metadata: buildAppMetadata(role),
  });

  if (authError || !authUser.user) {
    return { error: authError?.message ?? "Failed to create user" };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: authUser.user.id,
    full_name: parsed.full_name,
    email: parsed.email,
    role_id: parsed.role_id,
    status: true,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(authUser.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/users");
  return { success: true };
}

export async function updateUserAction(
  id: string,
  formData: {
    full_name: string;
    email: string;
    role_id: string;
    status: boolean;
  }
) {
  await requirePermission("users");
  const admin = createAdminClient();

  const role = await getRoleWithPermissions(formData.role_id);
  if (!role) return { error: "Invalid role" };

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: formData.full_name,
      email: formData.email,
      role_id: formData.role_id,
      status: formData.status,
    })
    .eq("id", id);

  if (profileError) return { error: profileError.message };

  await admin.auth.admin.updateUserById(id, {
    app_metadata: buildAppMetadata(role),
  });

  revalidatePath("/users");
  return { success: true, message: "User updated. They should sign in again for new permissions." };
}
