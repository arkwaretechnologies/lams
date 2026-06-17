import { requirePermission } from "@/lib/auth";
import { ImportClient } from "@/components/athletes/import-client";

export default async function ImportPage() {
  await requirePermission("athletes_import");
  return <ImportClient />;
}
