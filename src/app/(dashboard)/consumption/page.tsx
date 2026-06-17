import { requireProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { ConsumptionClient } from "@/components/consumption/consumption-client";

export default async function ConsumptionPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("remark_templates")
    .select("id, label, content, sort_order")
    .eq("status", true)
    .order("sort_order", { ascending: true });

  return (
    <ConsumptionClient
      userId={profile.id}
      initialTemplates={templates ?? []}
      canManageTemplates={hasPermission(
        profile.permissions,
        "remark_templates",
        profile.role.slug
      )}
    />
  );
}
