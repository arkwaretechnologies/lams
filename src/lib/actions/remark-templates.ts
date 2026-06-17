"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { remarkTemplateSchema } from "@/lib/validations/schemas";

export async function createRemarkTemplateAction(formData: {
  label: string;
  content: string;
  sort_order?: number;
  status?: boolean;
}) {
  await requirePermission("remark_templates");
  const parsed = remarkTemplateSchema.parse(formData);
  const supabase = await createClient();

  const { error } = await supabase.from("remark_templates").insert({
    label: parsed.label,
    content: parsed.content,
    sort_order: parsed.sort_order,
    status: parsed.status,
  });

  if (error) return { error: error.message };

  revalidatePath("/remark-templates");
  revalidatePath("/consumption");
  return { success: true };
}

export async function updateRemarkTemplateAction(
  id: string,
  formData: {
    label: string;
    content: string;
    sort_order?: number;
    status?: boolean;
  }
) {
  await requirePermission("remark_templates");
  const parsed = remarkTemplateSchema.parse(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("remark_templates")
    .update({
      label: parsed.label,
      content: parsed.content,
      sort_order: parsed.sort_order,
      status: parsed.status,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/remark-templates");
  revalidatePath("/consumption");
  return { success: true };
}

export async function deleteRemarkTemplateAction(id: string) {
  await requirePermission("remark_templates");
  const supabase = await createClient();

  const { error } = await supabase.from("remark_templates").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/remark-templates");
  revalidatePath("/consumption");
  return { success: true };
}
