import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { RfidClient } from "@/components/rfid/rfid-client";

export default async function RfidPage() {
  await requirePermission("rfid");
  const supabase = await createClient();
  const { data: athletes } = await supabase
    .from("athletes")
    .select("*")
    .order("full_name");

  return <RfidClient athletes={athletes ?? []} />;
}
