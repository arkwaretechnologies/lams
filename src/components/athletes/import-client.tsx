"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { TopBar } from "@/components/layout/top-bar";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importAthletes } from "@/lib/actions/mutations";
import { Upload } from "lucide-react";

interface ImportRow {
  student_id: string;
  full_name: string;
}

export function ImportClient() {
  const router = useRouter();
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [result, setResult] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (res) => {
          const parsed = (res.data as Record<string, string>[])
            .filter((r) => r.student_id && r.full_name)
            .map((r) => ({
              student_id: String(r.student_id).trim(),
              full_name: String(r.full_name).trim(),
            }));
          setRows(parsed);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target?.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
        const parsed = data
          .filter((r) => r.student_id && r.full_name)
          .map((r) => ({
            student_id: String(r.student_id).trim(),
            full_name: String(r.full_name).trim(),
          }));
        setRows(parsed);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Please upload a CSV or Excel file");
    }
  }, []);

  async function handleImport() {
    if (!rows.length) return;
    setLoading(true);
    const res = await importAthletes(rows);
    setResult(res);
    toast.success(`Imported ${res.imported}, skipped ${res.skipped}`);
    router.refresh();
    setLoading(false);
  }

  return (
    <>
      <TopBar title="Import Athletes" subtitle="Bulk upload roster from CSV or Excel" />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <LamsCard
          variant="ops"
          title="Bulk Import"
          description="Upload CSV or Excel with columns: student_id, full_name"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label>
                <Button variant="outline" type="button" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
                />
              </label>
              {rows.length > 0 && (
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? "Importing..." : `Import ${rows.length} rows`}
                </Button>
              )}
            </div>

            {rows.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Full Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 10).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><DataLabel>{r.student_id}</DataLabel></TableCell>
                      <TableCell>{r.full_name}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-muted-foreground">
                        ...and {rows.length - 10} more
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {result && (
              <div className="rounded-lg border p-4">
                <p>Imported: {result.imported}</p>
                <p>Skipped (duplicates): {result.skipped}</p>
                {result.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-destructive">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </LamsCard>
      </div>
    </>
  );
}
