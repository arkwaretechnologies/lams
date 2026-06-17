"use client";

import { createClient } from "@/lib/supabase/client";
import {
  getPendingConsumptions,
  removePendingConsumption,
  updatePendingError,
  cacheAthletes,
  cacheRemarkTemplates,
  type CachedAthlete,
} from "@/lib/db/local-db";
import { toast } from "sonner";

let syncing = false;

export async function refreshAthleteCache() {
  const supabase = createClient();
  const [{ data }, { data: templates }] = await Promise.all([
    supabase.from("athlete_daily_balance").select("*"),
    supabase
      .from("remark_templates")
      .select("id, label, content, sort_order")
      .eq("status", true)
      .order("sort_order", { ascending: true }),
  ]);
  if (data) {
    const cached: CachedAthlete[] = data
      .filter((a) => a.athlete_id && a.status)
      .map((a) => ({
        id: a.athlete_id!,
        student_id: a.student_id!,
        full_name: a.full_name!,
        rfid_tag: a.rfid_tag,
        status: a.status!,
        consumed_today: Number(a.consumed_today ?? 0),
        remaining_today: Number(a.remaining_today ?? 200),
        updated_at: new Date().toISOString(),
      }));
    await cacheAthletes(cached);
  }
  if (templates) {
    await cacheRemarkTemplates(templates);
  }
}

export async function syncPendingConsumptions() {
  if (syncing || !navigator.onLine) return;
  syncing = true;

  try {
    const supabase = createClient();
    const pending = await getPendingConsumptions();

    for (const item of pending) {
      const { error } = await supabase.rpc("record_consumption", {
        p_athlete_id: item.athleteId,
        p_amount: item.amount,
        p_recorded_by: item.recordedBy,
        p_client_id: item.clientId,
        p_remarks: item.remarks,
      });

      if (error) {
        if (error.message.includes("insufficient_balance")) {
          await updatePendingError(item.clientId, "Insufficient balance on sync");
          toast.error(`Sync failed: insufficient balance for queued transaction`);
        } else if (item.retryCount < 5) {
          await updatePendingError(item.clientId, error.message);
        }
        continue;
      }

      await removePendingConsumption(item.clientId);
    }

    await refreshAthleteCache();
  } finally {
    syncing = false;
  }
}

export function startSyncEngine() {
  if (typeof window === "undefined") return;

  refreshAthleteCache();
  syncPendingConsumptions();

  window.addEventListener("online", () => {
    syncPendingConsumptions();
    toast.success("Back online — syncing...");
  });

  setInterval(() => {
    if (navigator.onLine) syncPendingConsumptions();
  }, 30000);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && navigator.onLine) {
      syncPendingConsumptions();
    }
  });
}
