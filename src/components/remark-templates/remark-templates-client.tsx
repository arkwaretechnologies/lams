"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TopBar } from "@/components/layout/top-bar";
import { LamsCard } from "@/components/brand/lams-card";
import { EmptyState } from "@/components/brand/empty-state";
import { SectionHeader } from "@/components/brand/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import {
  createRemarkTemplateAction,
  updateRemarkTemplateAction,
  deleteRemarkTemplateAction,
} from "@/lib/actions/remark-templates";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/types/database";

type RemarkTemplateRow = Tables<"remark_templates">;

interface RemarkTemplatesClientProps {
  templates: RemarkTemplateRow[];
}

export function RemarkTemplatesClient({ templates }: RemarkTemplatesClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RemarkTemplateRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(true);

  function openCreate() {
    setEditing(null);
    setActive(true);
    setOpen(true);
  }

  function openEdit(template: RemarkTemplateRow) {
    setEditing(template);
    setActive(template.status);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const data = {
      label: fd.get("label") as string,
      content: fd.get("content") as string,
      sort_order: Number(fd.get("sort_order") ?? 0),
      status: active,
    };

    const result = editing
      ? await updateRemarkTemplateAction(editing.id, data)
      : await createRemarkTemplateAction(data);

    if (result.error) toast.error(result.error);
    else {
      toast.success(editing ? "Template updated" : "Template created");
      setOpen(false);
      setEditing(null);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const result = await deleteRemarkTemplateAction(id);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Template deleted");
      router.refresh();
    }
  }

  return (
    <>
      <TopBar
        title="Remark Templates"
        subtitle="Quick-insert phrases for consumption remarks"
      />
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <SectionHeader
          title="Meal remark templates"
          description="Quick-insert phrases used when recording consumption"
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Template
                  </Button>
                }
              />
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display">
                    {editing ? "Edit Template" : "New Template"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Label</Label>
                    <Input
                      id="label"
                      name="label"
                      defaultValue={editing?.label ?? ""}
                      placeholder="e.g. Breakfast"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      defaultValue={editing?.content ?? ""}
                      placeholder="Text inserted into remarks..."
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort_order">Sort order</Label>
                    <Input
                      id="sort_order"
                      name="sort_order"
                      type="number"
                      min={0}
                      defaultValue={editing?.sort_order ?? templates.length + 1}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="status"
                      checked={active}
                      onCheckedChange={(v) => setActive(v === true)}
                    />
                    <Label htmlFor="status">Active (visible on consumption page)</Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : editing ? "Update" : "Create"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <LamsCard title="Templates">
          {templates.length === 0 ? (
            <EmptyState
              title="No templates yet"
              description="Add remark templates to speed up consumption entry at the counter."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.sort_order}</TableCell>
                      <TableCell className="font-medium">{template.label}</TableCell>
                      <TableCell className="max-w-md truncate text-muted-foreground">
                        {template.content}
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.status ? "default" : "secondary"}>
                          {template.status ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(template)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete template?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{template.label}&quot; will be removed permanently.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(template.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </LamsCard>
      </div>
    </>
  );
}
