"use client";

import { useEffect, useState } from "react";
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
import { createUserAction, deleteUserAction, updateUserAction } from "@/lib/actions/mutations";
import { Copy, Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database";

type Profile = Tables<"profiles"> & { role_name: string };

interface SavedCredentials {
  full_name: string;
  email: string;
  password: string;
}

function formatCredentials({ full_name, email, password }: SavedCredentials) {
  return `LAMS Login Credentials\n\nName: ${full_name}\nEmail: ${email}\nPassword: ${password}`;
}

function formatCredentialsDisplay({ full_name, email, password }: SavedCredentials) {
  const masked = password.length > 0 ? "•".repeat(password.length) : "••••••";
  return `LAMS Login Credentials\n\nName: ${full_name}\nEmail: ${email}\nPassword: ${masked}`;
}

async function copyCredentials(credentials: SavedCredentials) {
  try {
    await navigator.clipboard.writeText(formatCredentials(credentials));
    toast.success("Credentials copied to clipboard");
  } catch {
    toast.error("Could not copy to clipboard");
  }
}

interface UserFormState {
  full_name: string;
  email: string;
  role_id: string;
  password: string;
  status: boolean;
}

function emptyForm(defaultRoleId: string): UserFormState {
  return {
    full_name: "",
    email: "",
    role_id: defaultRoleId,
    password: "",
    status: true,
  };
}

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savedCredentials, setSavedCredentials] = useState<SavedCredentials | null>(null);
  const [form, setForm] = useState<UserFormState>(() => emptyForm(roles[0]?.id ?? ""));

  useEffect(() => {
    if (!open) return;

    if (editing) {
      setForm({
        full_name: editing.full_name,
        email: editing.email,
        role_id: editing.role_id,
        password: "",
        status: editing.status,
      });
      return;
    }

    setForm(emptyForm(roles[0]?.id ?? ""));
  }, [open, editing, roles]);

  const showCopyCredentials = form.password.trim().length > 0;

  async function handleCopyCredentials() {
    const email = form.email.trim();
    const password = form.password.trim();
    const full_name = form.full_name.trim();

    if (!email || !password) {
      toast.error("Enter email and password first");
      return;
    }

    await copyCredentials({ full_name, email, password });
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteUserAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("User deleted");
      router.refresh();
    }
    setDeletingId(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const password = form.password.trim();
    const data = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role_id: form.role_id,
      status: form.status,
      ...(password ? { password } : {}),
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

      if (password) {
        setSavedCredentials({
          full_name: data.full_name,
          email: data.email,
          password,
        });
      }

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
              <form
                key={editing?.id ?? "new"}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={form.full_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role_id">Role</Label>
                  <select
                    id="role_id"
                    name="role_id"
                    value={form.role_id}
                    onChange={(e) => setForm((prev) => ({ ...prev, role_id: e.target.value }))}
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editing ? "New password" : "Password"}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required={!editing}
                    minLength={6}
                    placeholder={editing ? "Leave blank to keep current password" : undefined}
                    autoComplete="new-password"
                  />
                </div>
                {editing && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="status"
                      checked={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.checked }))}
                    />
                    Active
                  </label>
                )}
                <div className="flex gap-2">
                  {showCopyCredentials ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={loading}
                      onClick={() => void handleCopyCredentials()}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy credentials
                    </Button>
                  ) : null}
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          }
        />

        <Dialog
          open={savedCredentials !== null}
          onOpenChange={(open) => {
            if (!open) setSavedCredentials(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User credentials</DialogTitle>
            </DialogHeader>
            {savedCredentials ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Share these login details with {savedCredentials.full_name}. Use{" "}
                  <span className="font-medium text-foreground">Copy credentials</span> to copy
                  the full password — it is hidden on screen for security.
                </p>
                <div className="rounded-lg border bg-muted/40 p-4 font-mono text-sm whitespace-pre-wrap">
                  {formatCredentialsDisplay(savedCredentials)}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => void copyCredentials(savedCredentials)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy credentials
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setSavedCredentials(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

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
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing(u);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="ghost" size="icon" disabled={deletingId === u.id}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Permanently remove {u.full_name} ({u.email}). This cannot be undone.
                              Users with transaction history must be deactivated instead.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void handleDelete(u.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
