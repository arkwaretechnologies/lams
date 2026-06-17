import { requirePermission } from "@/lib/auth";
import { getRolesWithPermissions } from "@/lib/actions/roles";
import { RolesClient } from "@/components/roles/roles-client";

export default async function RolesPage() {
  await requirePermission("roles");
  const roles = await getRolesWithPermissions();
  return <RolesClient roles={roles} />;
}
