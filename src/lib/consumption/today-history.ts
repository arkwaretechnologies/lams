import { formatInTimeZone } from "date-fns-tz";
import { createClient } from "@/lib/supabase/client";
import { getPendingConsumptions } from "@/lib/db/local-db";
import { manilaToday } from "@/lib/utils/date";

const MANILA_TZ = "Asia/Manila";

export type TodayConsumptionItem = {
  id: string;
  amount: number;
  transactionTime: string;
  remarks?: string | null;
  pending?: boolean;
};

function isManilaDate(iso: string, date: string): boolean {
  return formatInTimeZone(new Date(iso), MANILA_TZ, "yyyy-MM-dd") === date;
}

export async function fetchTodayConsumptions(
  athleteId: string
): Promise<TodayConsumptionItem[]> {
  const today = manilaToday();
  const items: TodayConsumptionItem[] = [];

  if (navigator.onLine) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("consumptions")
      .select("id, amount, transaction_time, remarks")
      .eq("athlete_id", athleteId)
      .eq("transaction_date", today)
      .order("transaction_time", { ascending: false });

    if (!error) {
      for (const row of data ?? []) {
        items.push({
          id: row.id,
          amount: Number(row.amount),
          transactionTime: row.transaction_time,
          remarks: row.remarks,
        });
      }
    }
  }

  const pending = await getPendingConsumptions();
  for (const p of pending) {
    if (p.athleteId !== athleteId || !isManilaDate(p.createdAt, today)) continue;
    items.push({
      id: `pending-${p.clientId}`,
      amount: p.amount,
      transactionTime: p.createdAt,
      remarks: p.remarks,
      pending: true,
    });
  }

  items.sort(
    (a, b) =>
      new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime()
  );

  return items;
}
