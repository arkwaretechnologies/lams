"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { createUserAction, updateUserAction } from "@/lib/actions/mutations";
import { Plus, Pencil } from "lucide-react";
import type { Tables } from "@/types/database";

type Profile = Tables<"profiles"> & { role_name: string };

interface RoleOption {
  id: string;
  name: string;
  slug: string;
}

interface UsersClientProps {
  users: Profile[];
  roles: RoleOption[];
}

export function UsersClient({ users, roles }: UsersClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      full_name: fd.get("full_name") as string,
      email: fd.get("email") as string,
      role_id: fd.get("role_id") as string,
      status: fd.get("status") === "on",
      password: fd.get("password") as string,
    };

    const result = editing
      ? await updateUserAction(editing.id, data)
      : await createUserAction(data);

    if (result.error) toast.error(result.error);
    else {
      toast.success(
        "message" in result && typeof result.message === "string"
          ? result.message
          : editing
            ? "User updated"
            : "User created"
      );
      setOpen(false);
      setEditing(null);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <TopBar title="User Management" subtitle="Staff accounts and role assignments" />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <SectionHeader
          title="Staff accounts"
          description={`${users.length} users registered`}
          action={
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
              <DialogTrigger
                render={
                  <Button onClick={() => setEditing(null)}>
                    <Plus className="mr-2 h-4 w-4" /> Add User
                  </Button>
                }
              />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit User" : "Create User"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" name="full_name" defaultValue={editing?.full_name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editing?.email} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role_id">Role</Label>
                  <select
                    id="role_id"
                    name="role_id"
                    defaultValue={editing?.role_id ?? roles[0]?.id}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                {!editing && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required minLength={6} />
                  </div>
                )}
                {editing && (
                  <label className="flex items-center gap-2">
                    <input type="checkbox" name="status" defaultChecked={editing.status} />
                    Active
                  </label>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Saving..." : "Save"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          }
        />

        <LamsCard title="Users">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role_name}</TableCell>
                    <TableCell>
                      <Badge variant={u.status ? "default" : "secondary"}>
                        {u.status ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(u); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
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
