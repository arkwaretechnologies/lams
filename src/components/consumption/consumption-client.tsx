"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { LamsCard } from "@/components/brand/lams-card";
import { DataLabel } from "@/components/brand/data-label";
import { GoldRule } from "@/components/brand/gold-rule";
import { AthleteLookupInput } from "@/components/consumption/athlete-lookup-input";
import { ConsumptionTodayHistory } from "@/components/consumption/consumption-today-history";
import {
  AmountKeypad,
  RemarksField,
  type RemarkTemplate,
} from "@/components/consumption/amount-keypad";
import { createClient } from "@/lib/supabase/client";
import { recordConsumptionAction } from "@/lib/actions/mutations";
import {
  fetchTodayConsumptions,
  type TodayConsumptionItem,
} from "@/lib/consumption/today-history";
import {
  findCachedByRfid,
  searchCachedAthletes,
  queueConsumption,
  cacheRemarkTemplates,
  getCachedRemarkTemplates,
  type CachedAthlete,
} from "@/lib/db/local-db";
import { formatCurrency } from "@/lib/utils/date";
import { DAILY_ALLOWANCE } from "@/types/database";

interface ConsumptionClientProps {
  userId: string;
  initialTemplates: RemarkTemplate[];
  canManageTemplates: boolean;
}

function mapBalanceRow(d: {
  athlete_id: string | null;
  student_id: string | null;
  full_name: string | null;
  rfid_tag: string | null;
  status: boolean | null;
  consumed_today: number | null;
  remaining_today: number | null;
}): CachedAthlete | null {
  if (!d.athlete_id || !d.student_id || !d.full_name) return null;
  return {
    id: d.athlete_id,
    student_id: d.student_id,
    full_name: d.full_name,
    rfid_tag: d.rfid_tag,
    status: d.status ?? true,
    consumed_today: Number(d.consumed_today ?? 0),
    remaining_today: Number(d.remaining_today ?? DAILY_ALLOWANCE),
    updated_at: new Date().toISOString(),
  };
}

export function ConsumptionClient({
  userId,
  initialTemplates,
  canManageTemplates,
}: ConsumptionClientProps) {
  const [athlete, setAthlete] = useState<CachedAthlete | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<CachedAthlete[]>([]);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [templates, setTemplates] = useState<RemarkTemplate[]>(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [todayHistory, setTodayHistory] = useState<TodayConsumptionItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadTodayHistory = useCallback(async (athleteId: string) => {
    setHistoryLoading(true);
    const items = await fetchTodayConsumptions(athleteId);
    setTodayHistory(items);
    setHistoryLoading(false);
  }, []);

  const refreshTemplates = useCallback(async () => {
    if (!navigator.onLine) {
      const cached = await getCachedRemarkTemplates();
      setTemplates(cached);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("remark_templates")
      .select("id, label, content, sort_order")
      .eq("status", true)
      .order("sort_order", { ascending: true });
    if (data) {
      const next = data.map((t) => ({
        id: t.id,
        label: t.label,
        content: t.content,
        sort_order: t.sort_order,
      }));
      setTemplates(next);
      await cacheRemarkTemplates(next);
    }
  }, []);

  const resetEntry = useCallback(() => {
    setAmount("");
    setRemarks("");
  }, []);

  const selectAthlete = useCallback(
    (a: CachedAthlete) => {
      setAthlete(a);
      setSearch("");
      setSearchResults([]);
      setTodayHistory([]);
      resetEntry();
      void refreshTemplates();
      void loadTodayHistory(a.id);
    },
    [resetEntry, refreshTemplates, loadTodayHistory]
  );

  const lookupAthlete = useCallback(async (query: string): Promise<CachedAthlete | null> => {
    const q = query.trim();
    if (!q) return null;

    if (navigator.onLine) {
      const supabase = createClient();

      const { data: byRfid } = await supabase
        .from("athlete_daily_balance")
        .select("*")
        .eq("rfid_tag", q)
        .eq("status", true)
        .maybeSingle();
      const rfidMatch = byRfid ? mapBalanceRow(byRfid) : null;
      if (rfidMatch) return rfidMatch;

      const { data: byStudentId } = await supabase
        .from("athlete_daily_balance")
        .select("*")
        .eq("student_id", q)
        .eq("status", true)
        .maybeSingle();
      const idMatch = byStudentId ? mapBalanceRow(byStudentId) : null;
      if (idMatch) return idMatch;

      const { data: fuzzy } = await supabase
        .from("athlete_daily_balance")
        .select("*")
        .or(`student_id.ilike.%${q}%,full_name.ilike.%${q}%,rfid_tag.ilike.%${q}%`)
        .eq("status", true)
        .limit(2);
      const matches = (fuzzy ?? [])
        .map(mapBalanceRow)
        .filter((a): a is CachedAthlete => a !== null);
      if (matches.length === 1) return matches[0];
    } else {
      const byRfid = await findCachedByRfid(q);
      if (byRfid) return byRfid;

      const cached = await searchCachedAthletes(q);
      const exact = cached.find(
        (a) => a.student_id.toLowerCase() === q.toLowerCase() || a.rfid_tag === q
      );
      if (exact) return exact;
      if (cached.length === 1) return cached[0];
    }

    return null;
  }, []);

  async function handleSearch(q: string) {
    setSearch(q);
    if (q.length < 1) {
      setSearchResults([]);
      return;
    }

    if (navigator.onLine) {
      const supabase = createClient();
      const { data } = await supabase
        .from("athlete_daily_balance")
        .select("*")
        .or(`student_id.ilike.%${q}%,full_name.ilike.%${q}%,rfid_tag.ilike.%${q}%`)
        .eq("status", true)
        .limit(8);
      setSearchResults(
        (data ?? [])
          .map(mapBalanceRow)
          .filter((a): a is CachedAthlete => a !== null)
      );
    } else {
      const cached = await searchCachedAthletes(q);
      setSearchResults(cached.slice(0, 8));
    }
  }

  async function handleLookupSubmit(query: string) {
    if (lookupLoading) return;
    setLookupLoading(true);

    const found = await lookupAthlete(query);
    if (found) {
      selectAthlete(found);
    } else {
      toast.error("Athlete not found — scan RFID or pick from search results");
    }

    setLookupLoading(false);
  }

  async function handleSave() {
    if (!athlete) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (numAmount > athlete.remaining_today) {
      toast.error(`Only ${formatCurrency(athlete.remaining_today)} remaining`);
      return;
    }
    if (remarks.length > 500) {
      toast.error("Remarks must be 500 characters or less");
      return;
    }

    setLoading(true);
    const trimmedRemarks = remarks.trim() || undefined;

    if (navigator.onLine) {
      const result = await recordConsumptionAction(
        athlete.id,
        numAmount,
        undefined,
        trimmedRemarks
      );
      if (result.error) toast.error(result.error);
      else {
        toast.success(`Saved! Remaining: ${formatCurrency(result.remaining ?? 0)}`);
        setAthlete({
          ...athlete,
          consumed_today: athlete.consumed_today + numAmount,
          remaining_today: result.remaining ?? 0,
        });
        resetEntry();
        void loadTodayHistory(athlete.id);
      }
    } else {
      const clientId = crypto.randomUUID();
      await queueConsumption({
        clientId,
        athleteId: athlete.id,
        amount: numAmount,
        remarks: trimmedRemarks,
        recordedBy: userId,
        createdAt: new Date().toISOString(),
        retryCount: 0,
      });
      toast.success("Saved offline — will sync when online");
      setAthlete({
        ...athlete,
        consumed_today: athlete.consumed_today + numAmount,
        remaining_today: athlete.remaining_today - numAmount,
      });
      resetEntry();
      void loadTodayHistory(athlete.id);
    }

    setLoading(false);
  }

  return (
    <>
      <TopBar
        title="Consumption"
        subtitle="Cashier console · record meal transactions"
      />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="mx-auto max-w-lg space-y-5">
          {!athlete ? (
            <LamsCard
              variant="ops"
              title="Identify Athlete"
              description="Scan an RFID tag or type a name / student ID"
            >
              <AthleteLookupInput
                value={search}
                onChange={handleSearch}
                onSubmit={handleLookupSubmit}
                results={searchResults}
                onSelect={selectAthlete}
              />
              {!searchResults.length || !search.length ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Press Enter after scanning, or pick from suggestions while typing.
                </p>
              ) : null}
            </LamsCard>
          ) : (
            <>
              <div className="lams-gold-rule-top overflow-hidden rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-(--shadow-card)">
                <div className="border-b border-primary-foreground/10 px-5 py-4">
                  <p className="font-display text-xl font-semibold">{athlete.full_name}</p>
                  <DataLabel className="text-sm text-primary-foreground/80">
                    {athlete.student_id}
                    {athlete.rfid_tag ? ` · ${athlete.rfid_tag}` : ""}
                  </DataLabel>
                </div>
                <div className="grid grid-cols-3 divide-x divide-primary-foreground/10 text-center">
                  <div className="px-3 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-70">
                      Allowance
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                      {formatCurrency(DAILY_ALLOWANCE)}
                    </p>
                  </div>
                  <div className="px-3 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-70">
                      Consumed
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                      {formatCurrency(athlete.consumed_today)}
                    </p>
                  </div>
                  <div className="px-3 py-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-wider opacity-70">
                      Remaining
                    </p>
                    <p className="mt-1 font-display text-xl font-semibold text-accent tabular-nums">
                      {formatCurrency(athlete.remaining_today)}
                    </p>
                  </div>
                </div>
              </div>

              <ConsumptionTodayHistory
                items={todayHistory}
                loading={historyLoading && todayHistory.length === 0}
              />

              <LamsCard variant="ops" goldRule={false} className="lams-gold-rule-top">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                  Amount &amp; Remarks
                </p>
                <div className="space-y-5">
                  <AmountKeypad
                    value={amount}
                    onChange={setAmount}
                    maxAmount={athlete.remaining_today}
                  />
                  <GoldRule className="opacity-30" />
                  <RemarksField
                    value={remarks}
                    onChange={setRemarks}
                    templates={templates}
                    canManageTemplates={canManageTemplates}
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      className="h-11 flex-1"
                      onClick={() => {
                        setAthlete(null);
                        setTodayHistory([]);
                        resetEntry();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button className="h-11 flex-1" onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : "Save Transaction"}
                    </Button>
                  </div>
                </div>
              </LamsCard>
            </>
          )}
        </div>
      </div>
    </>
  );
}
