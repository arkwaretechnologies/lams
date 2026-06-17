import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { StatTile } from "@/components/brand/stat-tile";
import { SectionHeader } from "@/components/brand/section-header";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { EmptyState } from "@/components/brand/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { manilaToday, formatCurrency, formatTime, formatDate } from "@/lib/utils/date";
import { Users, Receipt, Wallet, Clock } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const today = manilaToday();
  const monthStart = today.slice(0, 8) + "01";

  const [
    { count: athleteCount },
    { data: todayConsumptions },
    { data: monthConsumptions },
    { data: recent },
  ] = await Promise.all([
    supabase.from("athletes").select("*", { count: "exact", head: true }).eq("status", true),
    supabase.from("consumptions").select("amount").eq("transaction_date", today),
    supabase.from("consumptions").select("amount").gte("transaction_date", monthStart),
    supabase
      .from("consumptions")
      .select("id, amount, transaction_time, athletes(full_name, student_id), profiles(full_name)")
      .order("transaction_time", { ascending: false })
      .limit(10),
  ]);

  const todayTotal = todayConsumptions?.reduce((s, c) => s + Number(c.amount), 0) ?? 0;
  const monthTotal = monthConsumptions?.reduce((s, c) => s + Number(c.amount), 0) ?? 0;

  const stats = [
    { title: "Athletes", value: athleteCount ?? 0, icon: Users },
    { title: "Transactions Today", value: todayConsumptions?.length ?? 0, icon: Receipt },
    { title: "Consumption Today", value: formatCurrency(todayTotal), icon: Wallet },
    { title: "Month to Date", value: formatCurrency(monthTotal), icon: Clock },
  ];

  return (
    <>
      <TopBar
        title="Dashboard"
        subtitle={`Today · ${formatDate(today)} · Asia/Manila`}
      />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <SectionHeader
          title="Today's operations"
          description="Live overview of athlete meal activity"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatTile key={stat.title} {...stat} />
          ))}
        </div>

        <div className="mt-8">
          <LamsCard title="Recent Transactions" description="Latest meal consumption records">
            {recent?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Athlete</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Recorded By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.map((tx) => {
                    const athlete = tx.athletes as unknown as {
                      full_name: string;
                      student_id: string;
                    } | null;
                    const recorder = tx.profiles as unknown as { full_name: string } | null;
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <DataLabel>{formatTime(tx.transaction_time)}</DataLabel>
                        </TableCell>
                        <TableCell>
                          {athlete?.full_name}
                          <DataLabel className="ml-1 text-xs text-muted-foreground">
                            ({athlete?.student_id})
                          </DataLabel>
                        </TableCell>
                        <TableCell>
                          <DataLabel className="font-semibold text-primary">
                            {formatCurrency(Number(tx.amount))}
                          </DataLabel>
                        </TableCell>
                        <TableCell>{recorder?.full_name}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No transactions yet"
                description="Consumption records will appear here once cashiers start recording meals."
              />
            )}
          </LamsCard>
        </div>
      </div>
    </>
  );
}
