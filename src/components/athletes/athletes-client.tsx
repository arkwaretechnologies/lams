"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { EmptyState } from "@/components/brand/empty-state";
import { SectionHeader } from "@/components/brand/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createAthlete, updateAthlete } from "@/lib/actions/mutations";
import { Plus, Pencil } from "lucide-react";
import type { Tables } from "@/types/database";

type Athlete = Tables<"athletes">;

interface AthletesClientProps {
  athletes: Athlete[];
}

export function AthletesClient({ athletes }: AthletesClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Athlete | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = athletes.filter(
    (a) =>
      a.student_id.toLowerCase().includes(search.toLowerCase()) ||
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.rfid_tag?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      student_id: fd.get("student_id") as string,
      full_name: fd.get("full_name") as string,
      rfid_tag: (fd.get("rfid_tag") as string) || null,
      status: fd.get("status") === "on",
    };

    const result = editing
      ? await updateAthlete(editing.id, data)
      : await createAthlete(data);

    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Athlete updated" : "Athlete created");
      setOpen(false);
      setEditing(null);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <TopBar title="Athletes" subtitle="Student-athlete roster and RFID references" />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <SectionHeader
          title="Roster"
          description={`${filtered.length} athletes on record`}
          action={
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
              <DialogTrigger
                render={<Button><Plus className="mr-2 h-4 w-4" />Add Athlete</Button>}
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {editing ? "Edit Athlete" : "Add Athlete"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input id="student_id" name="student_id" className="font-data" defaultValue={editing?.student_id} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" name="full_name" defaultValue={editing?.full_name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfid_tag">RFID Tag</Label>
                    <Input id="rfid_tag" name="rfid_tag" className="font-data" defaultValue={editing?.rfid_tag ?? ""} />
                  </div>
                  {editing && (
                    <label className="flex items-center gap-2">
                      <input type="checkbox" name="status" defaultChecked={editing.status} />
                      Active
                    </label>
                  )}
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <Input
          placeholder="Search by ID, name, or RFID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-5 max-w-sm"
        />

        <LamsCard title="Athletes" goldRule={false} className="lams-gold-rule-top">
          {filtered.length === 0 ? (
            <EmptyState
              title="No athletes found"
              description="Add athletes manually or import from a spreadsheet."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>RFID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <DataLabel>{a.student_id}</DataLabel>
                    </TableCell>
                    <TableCell>{a.full_name}</TableCell>
                    <TableCell>
                      <DataLabel className="text-sm">{a.rfid_tag ?? "—"}</DataLabel>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status ? "default" : "secondary"}>
                        {a.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditing(a); setOpen(true); }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
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
