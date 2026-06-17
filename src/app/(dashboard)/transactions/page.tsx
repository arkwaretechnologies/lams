import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage() {
  await requireProfile();
  const supabase = await createClient();

  const [{ data: transactions }, { data: athletes }, { data: staff }] =
    await Promise.all([
      supabase
        .from("consumptions")
        .select(
          "id, amount, remarks, transaction_date, transaction_time, athletes(full_name, student_id), profiles(full_name)"
        )
        .order("transaction_time", { ascending: false })
        .limit(500),
      supabase.from("athletes").select("id, full_name, student_id").eq("status", true),
      supabase.from("profiles").select("id, full_name").eq("status", true),
    ]);

  return (
    <TransactionsClient
      transactions={(transactions ?? []) as unknown as Parameters<typeof TransactionsClient>[0]["transactions"]}
      athletes={athletes ?? []}
      staff={staff ?? []}
    />
  );
}
