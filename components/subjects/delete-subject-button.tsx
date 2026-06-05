"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteSubject } from "@/actions/subjects";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteSubjectButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSubject(id);
      if (result.success) {
        toast.success("Subject deleted");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This will permanently delete the subject and all its attendance records.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
