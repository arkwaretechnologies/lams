"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LamsCard } from "@/components/brand/lams-card";
import { SectionHeader } from "@/components/brand/section-header";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createRoleAction, updateRoleAction, deleteRoleAction } from "@/lib/actions/roles";
import { PERMISSIONS, type PermissionKey } from "@/lib/permissions";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database";

type RoleRow = Tables<"roles"> & { permissions: string[] };

interface RolesClientProps {
  roles: RoleRow[];
}

export function RolesClient({ roles }: RolesClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<PermissionKey[]>([]);

  function openEdit(role: RoleRow) {
    setEditing(role);
    setSelectedPerms(role.permissions as PermissionKey[]);
    setOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setSelectedPerms([]);
    setOpen(true);
  }

  function togglePerm(key: PermissionKey) {
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
      permissions: editing?.slug === "administrator"
        ? (PERMISSIONS.map((p) => p.key) as PermissionKey[])
        : selectedPerms,
    };

    const result = editing
      ? await updateRoleAction(editing.id, data)
      : await createRoleAction(data);

    if (result.error) toast.error(result.error);
    else {
      toast.success(
        "message" in result && typeof result.message === "string"
          ? result.message
          : editing
            ? "Role updated"
            : "Role created"
      );
      setOpen(false);
      setEditing(null);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteRoleAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Role deleted");
      router.refresh();
    }
  }

  return (
    <>
      <TopBar title="Roles" subtitle="Configure access permissions per role" />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <SectionHeader
          title="Role permissions"
          description={`${roles.length} roles configured`}
          action={
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
              <DialogTrigger
                render={
                  <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                  </Button>
                }
              />
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? "Edit Role" : "Create Role"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editing?.name}
                    required
                    disabled={editing?.is_system}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editing?.description ?? ""}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Page Access</Label>
                  {editing?.slug === "administrator" ? (
                    <p className="text-sm text-muted-foreground">
                      Administrator has access to all pages.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PERMISSIONS.map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-2 rounded-md border p-2 text-sm"
                        >
                          <Checkbox
                            checked={selectedPerms.includes(perm.key)}
                            onCheckedChange={() => togglePerm(perm.key)}
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save Role"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          }
        />

        <LamsCard title="Roles">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">
                      {role.name}
                      {role.is_system && (
                        <Badge variant="secondary" className="ml-2">
                          System
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description ?? "—"}
                    </TableCell>
                    <TableCell>{role.permissions.length} pages</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(role)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!role.is_system && (
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            }
                          />
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete role?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This cannot be undone. Users must be reassigned first.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(role.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </LamsCard>
      </div>
    </>
  );
}
