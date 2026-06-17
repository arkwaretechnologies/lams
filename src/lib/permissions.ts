export const PERMISSIONS = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "consumption", label: "Consumption", path: "/consumption" },
  { key: "remark_templates", label: "Remark Templates", path: "/remark-templates" },
  { key: "athletes", label: "Athletes", path: "/athletes" },
  { key: "athletes_import", label: "Import Athletes", path: "/athletes/import" },
  { key: "rfid", label: "RFID Assignment", path: "/rfid" },
  { key: "transactions", label: "Transactions", path: "/transactions" },
  { key: "reports", label: "Reports", path: "/reports" },
  { key: "users", label: "Users", path: "/users" },
  { key: "roles", label: "Roles", path: "/roles" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSIONS.map((p) => p.key);

export const ROUTE_PERMISSION_MAP: Record<string, PermissionKey> = {
  "/": "dashboard",
  "/consumption": "consumption",
  "/remark-templates": "remark_templates",
  "/athletes": "athletes",
  "/athletes/import": "athletes_import",
  "/rfid": "rfid",
  "/transactions": "transactions",
  "/reports": "reports",
  "/users": "users",
  "/roles": "roles",
};

export function getRequiredPermission(pathname: string): PermissionKey | null {
  if (ROUTE_PERMISSION_MAP[pathname]) {
    return ROUTE_PERMISSION_MAP[pathname];
  }
  const sorted = Object.entries(ROUTE_PERMISSION_MAP).sort(
    (a, b) => b[0].length - a[0].length
  );
  for (const [route, permission] of sorted) {
    if (route !== "/" && pathname.startsWith(route)) {
      return permission;
    }
  }
  return null;
}

export function hasPermission(
  permissions: string[] | undefined,
  key: PermissionKey,
  roleSlug?: string
): boolean {
  if (roleSlug === "administrator") return true;
  if (!permissions) return false;
  return permissions.includes(key);
}
