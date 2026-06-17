"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { getPendingCount } from "@/lib/db/local-db";

type SyncState = "synced" | "pending" | "offline";

export function SyncStatusBadge() {
  const [state, setState] = useState<SyncState>("synced");
  const [pending, setPending] = useState(0);

  useEffect(() => {
    async function check() {
      const online = navigator.onLine;
      const count = await getPendingCount();
      setPending(count);
      if (!online) setState("offline");
      else if (count > 0) setState("pending");
      else setState("synced");
    }

    check();
    const interval = setInterval(check, 5000);
    window.addEventListener("online", check);
    window.addEventListener("offline", check);
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", check);
      window.removeEventListener("offline", check);
    };
  }, []);

  const config = {
    synced: {
      label: "Synced",
      className: "bg-green-600 hover:bg-green-600",
      icon: Cloud,
    },
    pending: {
      label: `Pending Sync (${pending})`,
      className: "bg-yellow-600 hover:bg-yellow-600",
      icon: RefreshCw,
    },
    offline: {
      label: "Offline",
      className: "bg-red-600 hover:bg-red-600",
      icon: CloudOff,
    },
  }[state];

  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
