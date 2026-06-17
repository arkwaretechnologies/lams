"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { EmptyState } from "@/components/brand/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils/date";

interface Transaction {
  id: string;
  amount: number;
  remarks: string | null;
  transaction_date: string;
  transaction_time: string;
  athletes: { full_name: string; student_id: string } | null;
  profiles: { full_name: string } | null;
}

interface Profile {
  id: string;
  full_name: string;
}

interface TransactionsClientProps {
  transactions: Transaction[];
  athletes: { id: string; full_name: string; student_id: string }[];
  staff: Profile[];
}

export function TransactionsClient({
  transactions: initial,
  athletes,
  staff,
}: TransactionsClientProps) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [athleteId, setAthleteId] = useState("all");
  const [staffId, setStaffId] = useState("all");

  const filtered = initial.filter((tx) => {
    if (dateFrom && tx.transaction_date < dateFrom) return false;
    if (dateTo && tx.transaction_date > dateTo) return false;
    if (athleteId !== "all") {
      const a = athletes.find((x) => x.id === athleteId);
      if (a && tx.athletes?.student_id !== a.student_id) return false;
    }
    if (staffId !== "all") {
      const s = staff.find((x) => x.id === staffId);
      if (s && tx.profiles?.full_name !== s.full_name) return false;
    }
    return true;
  });

  return (
    <>
      <TopBar
        title="Transactions"
        subtitle="Audit trail of all meal consumption records"
      />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <LamsCard title="Filters" className="mb-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="athlete-filter">Athlete</Label>
              <select
                id="athlete-filter"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="all">All athletes</option>
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>{a.full_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-filter">Staff</Label>
              <select
                id="staff-filter"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="all">All staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </LamsCard>

        <LamsCard title={`${filtered.length} Transactions`}>
          {filtered.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Adjust your filters or record consumption to see entries here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Athlete</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <DataLabel>{formatDate(tx.transaction_date)}</DataLabel>
                    </TableCell>
                    <TableCell>
                      <DataLabel>{formatTime(tx.transaction_time)}</DataLabel>
                    </TableCell>
                    <TableCell>
                      {tx.athletes?.full_name}
                      <DataLabel className="ml-1 text-xs text-muted-foreground">
                        ({tx.athletes?.student_id})
                      </DataLabel>
                    </TableCell>
                    <TableCell>
                      <DataLabel className="font-semibold text-primary">
                        {formatCurrency(Number(tx.amount))}
                      </DataLabel>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {tx.remarks || "—"}
                    </TableCell>
                    <TableCell>{tx.profiles?.full_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </LamsCard>
      </div>
    </>
  );
}
