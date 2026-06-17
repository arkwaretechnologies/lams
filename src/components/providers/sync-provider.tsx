"use client";

import { useEffect } from "react";
import { startSyncEngine } from "@/lib/sync/sync-engine";

export function SyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    startSyncEngine();
  }, []);

  return <>{children}</>;
}
