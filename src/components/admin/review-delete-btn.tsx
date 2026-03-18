"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteReview } from "@/actions/admin";

export function ReviewDeleteBtn({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteReview(id);
        toast({ title: "Review deleted" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-600"
      title="Delete review"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
