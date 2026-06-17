import Dexie, { type Table } from "dexie";

export interface CachedAthlete {
  id: string;
  student_id: string;
  full_name: string;
  rfid_tag: string | null;
  status: boolean;
  consumed_today: number;
  remaining_today: number;
  updated_at: string;
}

export interface PendingConsumption {
  clientId: string;
  athleteId: string;
  amount: number;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

export interface CachedRemarkTemplate {
  id: string;
  label: string;
  content: string;
  sort_order: number;
}

export interface SyncMeta {
  key: string;
  value: string;
}

class LamsDB extends Dexie {
  athletes!: Table<CachedAthlete>;
  pendingConsumptions!: Table<PendingConsumption>;
  remarkTemplates!: Table<CachedRemarkTemplate>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super("lams-db");
    this.version(1).stores({
      athletes: "id, student_id, rfid_tag, full_name",
      pendingConsumptions: "clientId, athleteId, createdAt",
      syncMeta: "key",
    });
    this.version(2).stores({
      athletes: "id, student_id, rfid_tag, full_name",
      pendingConsumptions: "clientId, athleteId, createdAt",
      remarkTemplates: "id, sort_order",
      syncMeta: "key",
    });
  }
}

export const db = typeof window !== "undefined" ? new LamsDB() : (null as unknown as LamsDB);

export async function getPendingCount(): Promise<number> {
  if (!db) return 0;
  return db.pendingConsumptions.count();
}

export async function cacheAthletes(athletes: CachedAthlete[]) {
  if (!db) return;
  await db.athletes.clear();
  await db.athletes.bulkPut(athletes);
  await db.syncMeta.put({
    key: "lastAthleteSyncAt",
    value: new Date().toISOString(),
  });
}

export async function searchCachedAthletes(query: string): Promise<CachedAthlete[]> {
  if (!db) return [];
  const q = query.toLowerCase().trim();
  if (!q) return db.athletes.filter((a) => a.status).toArray();
  return db.athletes
    .filter(
      (a) =>
        a.status &&
        (a.student_id.toLowerCase().includes(q) ||
          a.full_name.toLowerCase().includes(q) ||
          (a.rfid_tag?.toLowerCase().includes(q) ?? false))
    )
    .toArray();
}

export async function findCachedByRfid(rfid: string): Promise<CachedAthlete | undefined> {
  if (!db) return undefined;
  return db.athletes.where("rfid_tag").equals(rfid).first();
}

export async function queueConsumption(item: PendingConsumption) {
  if (!db) return;
  await db.pendingConsumptions.put(item);
}

export async function getPendingConsumptions(): Promise<PendingConsumption[]> {
  if (!db) return [];
  return db.pendingConsumptions.orderBy("createdAt").toArray();
}

export async function removePendingConsumption(clientId: string) {
  if (!db) return;
  await db.pendingConsumptions.delete(clientId);
}

export async function updatePendingError(clientId: string, error: string) {
  if (!db) return;
  const item = await db.pendingConsumptions.get(clientId);
  if (item) {
    await db.pendingConsumptions.put({
      ...item,
      retryCount: item.retryCount + 1,
      lastError: error,
    });
  }
}

export async function cacheRemarkTemplates(templates: CachedRemarkTemplate[]) {
  if (!db) return;
  await db.remarkTemplates.clear();
  await db.remarkTemplates.bulkPut(templates);
}

export async function getCachedRemarkTemplates(): Promise<CachedRemarkTemplate[]> {
  if (!db) return [];
  return db.remarkTemplates.orderBy("sort_order").toArray();
}
