"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema, type SubjectInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { createSubject, updateSubject } from "@/actions/subjects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubjectFormProps {
  mode: "create" | "edit";
  defaultValues?: SubjectInput & { id?: string };
}

export function SubjectForm({ mode, defaultValues }: SubjectFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: defaultValues ?? {
      name: "",
      code: "",
      attendanceWeight: 1,
    },
  });

  const onSubmit = async (data: SubjectInput) => {
    setLoading(true);
    try {
      const result =
        mode === "create"
          ? await createSubject(data)
          : await updateSubject(defaultValues?.id ?? "", data);

      if (result.success) {
        toast.success(mode === "create" ? "Subject created" : "Subject updated");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Subject" : "Edit Subject"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subject Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Physics" />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Subject Code (optional)</Label>
            <Input id="code" {...form.register("code")} placeholder="PHY101" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight">Attendance Weight</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              max={10}
              {...form.register("attendanceWeight", { valueAsNumber: true })}
            />
            {form.formState.errors.attendanceWeight && (
              <p className="text-xs text-red-500">
                {form.formState.errors.attendanceWeight.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Labs typically have higher weights (e.g., Physics Lab = 2)
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : mode === "create" ? "Create Subject" : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
