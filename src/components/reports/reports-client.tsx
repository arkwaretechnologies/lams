"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { SectionHeader } from "@/components/brand/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/date";
import { exportToExcel } from "@/lib/exports/export-to-excel";
import { exportToPdf } from "@/lib/exports/export-to-pdf";
import { FileDown } from "lucide-react";

interface DailyRow {
  student_id: string;
  full_name: string;
  total: number;
}

interface ReportsClientProps {
  dailyData: DailyRow[];
  monthlyData: DailyRow[];
  grandTotal: number;
  selectedDate: string;
  selectedMonth: number;
  selectedYear: number;
}

export function ReportsClient({
  dailyData: initialDaily,
  monthlyData: initialMonthly,
  grandTotal: initialGrand,
  selectedDate,
  selectedMonth,
  selectedYear,
}: ReportsClientProps) {
  const [date, setDate] = useState(selectedDate);
  const [month, setMonth] = useState(String(selectedMonth));
  const [year, setYear] = useState(String(selectedYear));

  const dailyHeaders = ["Student ID", "Athlete Name", "Daily Total"];
  const monthlyHeaders = ["Student ID", "Athlete Name", "Monthly Total"];

  function exportDailyExcel() {
    exportToExcel(
      `daily-report-${date}.xlsx`,
      dailyHeaders,
      initialDaily.map((r) => [r.student_id, r.full_name, r.total])
    );
  }

  function exportMonthlyExcel() {
    exportToExcel(
      `monthly-report-${year}-${month}.xlsx`,
      monthlyHeaders,
      initialMonthly.map((r) => [r.student_id, r.full_name, r.total])
    );
  }

  async function exportDailyPdf() {
    await exportToPdf(
      `daily-report-${date}.pdf`,
      `Daily Consumption Report — ${date}`,
      dailyHeaders,
      initialDaily.map((r) => [r.student_id, r.full_name, formatCurrency(r.total)])
    );
  }

  async function exportMonthlyPdf() {
    await exportToPdf(
      `monthly-report-${year}-${month}.pdf`,
      `Monthly Billing Report — ${year}-${month}`,
      monthlyHeaders,
      initialMonthly.map((r) => [r.student_id, r.full_name, formatCurrency(r.total)]),
      `Grand Total: ${formatCurrency(initialGrand)}`
    );
  }

  return (
    <>
      <TopBar title="Reports" subtitle="Daily consumption and monthly billing summaries" />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <SectionHeader
          title="Billing & consumption reports"
          description="Export daily or monthly summaries for finance review"
        />
        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily Report</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4">
            <LamsCard
              title="Daily Consumption"
              headerAction={
                <form className="flex items-end gap-2" action="/reports" method="get">
                  <input type="hidden" name="tab" value="daily" />
                  <div className="space-y-1">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="secondary">Apply</Button>
                </form>
              }
            >
              <div className="mb-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={exportDailyExcel}>
                  <FileDown className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportDailyPdf}>
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {dailyHeaders.map((h) => <TableHead key={h}>{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialDaily.map((r) => (
                    <TableRow key={r.student_id}>
                      <TableCell><DataLabel>{r.student_id}</DataLabel></TableCell>
                      <TableCell>{r.full_name}</TableCell>
                      <TableCell>
                        <DataLabel className="font-semibold text-primary">
                          {formatCurrency(r.total)}
                        </DataLabel>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </LamsCard>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <LamsCard
              title="Monthly Billing"
              headerAction={
                <form className="flex items-end gap-2" action="/reports" method="get">
                  <input type="hidden" name="tab" value="monthly" />
                  <div className="space-y-1">
                    <Label htmlFor="month">Month</Label>
                    <select
                      id="month"
                      name="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="flex h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1)}>
                          {new Date(2000, i).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Year</Label>
                    <Input name="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-24" />
                  </div>
                  <Button type="submit" variant="secondary">Apply</Button>
                </form>
              }
            >
              <div className="mb-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={exportMonthlyExcel}>
                  <FileDown className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" size="sm" onClick={exportMonthlyPdf}>
                  <FileDown className="mr-2 h-4 w-4" /> PDF
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    {monthlyHeaders.map((h) => <TableHead key={h}>{h}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialMonthly.map((r) => (
                    <TableRow key={r.student_id}>
                      <TableCell><DataLabel>{r.student_id}</DataLabel></TableCell>
                      <TableCell>{r.full_name}</TableCell>
                      <TableCell>
                        <DataLabel className="font-semibold text-primary">
                          {formatCurrency(r.total)}
                        </DataLabel>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-4 font-display text-lg font-semibold">
                Grand Total:{" "}
                <DataLabel className="text-primary">{formatCurrency(initialGrand)}</DataLabel>
              </p>
            </LamsCard>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
