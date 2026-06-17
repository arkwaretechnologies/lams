"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { EmptyState } from "@/components/brand/empty-state";
import { RfidScanInput } from "@/components/rfid-scan-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { assignRfid } from "@/lib/actions/mutations";
import type { Tables } from "@/types/database";

type Athlete = Tables<"athletes">;

interface RfidClientProps {
  athletes: Athlete[];
}

export function RfidClient({ athletes }: RfidClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Athlete | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [scannedTag, setScannedTag] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = athletes
    .filter((a) => a.status)
    .filter(
      (a) =>
        a.full_name.toLowerCase().includes(search.toLowerCase()) ||
        a.student_id.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 10);

  function openAssignModal(athlete: Athlete) {
    setSelected(athlete);
    setScannedTag("");
    setAssignOpen(true);
  }

  function closeAssignModal() {
    setAssignOpen(false);
    setScannedTag("");
    setSelected(null);
  }

  function handleScan(tag: string) {
    setScannedTag(tag);
  }

  async function confirmAssign() {
    if (!selected || !scannedTag.trim()) {
      toast.error("Scan or enter an RFID tag first");
      return;
    }

    const tag = scannedTag.trim();

    if (selected.rfid_tag === tag) {
      toast.info("This RFID is already assigned to this athlete");
      return;
    }

    setLoading(true);
    const result = await assignRfid(selected.id, tag);
    if (result.error) toast.error(result.error);
    else {
      toast.success(`RFID assigned to ${selected.full_name}`);
      setReplaceOpen(false);
      closeAssignModal();
      router.refresh();
    }
    setLoading(false);
  }

  function handleSave() {
    if (!selected || !scannedTag.trim()) {
      toast.error("Scan or enter an RFID tag first");
      return;
    }

    if (selected.rfid_tag && selected.rfid_tag !== scannedTag.trim()) {
      setReplaceOpen(true);
      return;
    }

    void confirmAssign();
  }

  return (
    <>
      <TopBar
        title="RFID Assignment"
        subtitle="Link athlete roster entries to physical RFID tags"
      />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="mx-auto max-w-2xl">
          <LamsCard
            variant="ops"
            title="Athlete Roster"
            description="Select an athlete to assign or replace their RFID tag."
          >
            <Input
              placeholder="Search by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-3 space-y-2">
              {filtered.length === 0 ? (
                <EmptyState
                  title={search ? "No matches found" : "Search the roster"}
                  description={
                    search
                      ? "Try a different name or student ID."
                      : "Start typing to find an athlete."
                  }
                />
              ) : (
                filtered.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openAssignModal(a)}
                    className="w-full rounded-md border border-border/80 px-4 py-3 text-left transition-colors duration-200 hover:border-primary/30 hover:bg-muted/50 lams-gold-rule-left"
                  >
                    <p className="font-medium">{a.full_name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      <DataLabel>{a.student_id}</DataLabel>
                      {a.rfid_tag ? (
                        <>
                          {" · "}
                          <DataLabel>{a.rfid_tag}</DataLabel>
                        </>
                      ) : (
                        " · No RFID"
                      )}
                    </p>
                  </button>
                ))
              )}
            </div>
          </LamsCard>
        </div>
      </div>

      <Dialog
        open={assignOpen}
        onOpenChange={(open) => {
          if (!open) closeAssignModal();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Assign RFID Tag</DialogTitle>
            <DialogDescription>
              Scan or type the RFID tag to assign to this athlete.
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{selected.full_name}</p>
                <p className="text-muted-foreground">
                  <DataLabel>{selected.student_id}</DataLabel>
                </p>
                <p className="mt-2 text-muted-foreground">
                  Current RFID:{" "}
                  {selected.rfid_tag ? (
                    <DataLabel>{selected.rfid_tag}</DataLabel>
                  ) : (
                    <span className="italic">None</span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">RFID Tag</p>
                <RfidScanInput
                  key={selected.id}
                  onScan={handleScan}
                  placeholder="Scan RFID tag..."
                />
                <Input
                  className="font-data"
                  placeholder="Or type tag manually..."
                  value={scannedTag}
                  onChange={(e) => setScannedTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeAssignModal} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || !scannedTag.trim()}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={replaceOpen} onOpenChange={setReplaceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace existing RFID?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected?.full_name} already has RFID tag{" "}
              <code>{selected?.rfid_tag}</code>. Replace it with{" "}
              <code>{scannedTag.trim()}</code>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmAssign()} disabled={loading}>
              {loading ? "Saving..." : "Replace Tag"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
