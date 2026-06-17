import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth";
import { manilaToday } from "@/lib/utils/date";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; month?: string; year?: string }>;
}) {
  await requirePermission("reports");
  const params = await searchParams;
  const supabase = await createClient();

  const today = manilaToday();
  const date = params.date ?? today;
  const month = parseInt(params.month ?? String(new Date().getMonth() + 1));
  const year = parseInt(params.year ?? String(new Date().getFullYear()));
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const [{ data: dailyRaw }, { data: monthlyRaw }] = await Promise.all([
    supabase
      .from("consumptions")
      .select("amount, athletes(student_id, full_name)")
      .eq("transaction_date", date),
    supabase
      .from("consumptions")
      .select("amount, athletes(student_id, full_name)")
      .gte("transaction_date", monthStart)
      .lt("transaction_date", monthEnd),
  ]);

  function aggregate(
    rows: { amount: number; athletes: { student_id: string; full_name: string } | null }[] | null
  ) {
    const map = new Map<string, { student_id: string; full_name: string; total: number }>();
    rows?.forEach((r) => {
      const a = r.athletes;
      if (!a) return;
      const key = a.student_id;
      const existing = map.get(key);
      if (existing) existing.total += Number(r.amount);
      else map.set(key, { student_id: a.student_id, full_name: a.full_name, total: Number(r.amount) });
    });
    return Array.from(map.values()).sort((a, b) => a.student_id.localeCompare(b.student_id));
  }

  const dailyData = aggregate(dailyRaw as Parameters<typeof aggregate>[0]);
  const monthlyData = aggregate(monthlyRaw as Parameters<typeof aggregate>[0]);
  const grandTotal = monthlyData.reduce((s, r) => s + r.total, 0);

  return (
    <ReportsClient
      dailyData={dailyData}
      monthlyData={monthlyData}
      grandTotal={grandTotal}
      selectedDate={date}
      selectedMonth={month}
      selectedYear={year}
    />
  );
}
