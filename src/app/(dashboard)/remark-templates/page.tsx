import { requirePermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RemarkTemplatesClient } from "@/components/remark-templates/remark-templates-client";

export default async function RemarkTemplatesPage() {
  await requirePermission("remark_templates");
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("remark_templates")
    .select("*")
    .order("sort_order", { ascending: true });

  return <RemarkTemplatesClient templates={templates ?? []} />;
}
