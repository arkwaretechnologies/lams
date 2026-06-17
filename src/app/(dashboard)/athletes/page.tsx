import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { AthletesClient } from "@/components/athletes/athletes-client";

export default async function AthletesPage() {
  await requirePermission("athletes");
  const supabase = await createClient();
  const { data: athletes } = await supabase
    .from("athletes")
    .select("*")
    .order("created_at", { ascending: false });

  return <AthletesClient athletes={athletes ?? []} />;
}
