"use client";

import { useTransition } from "react";
import { Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { togglePromoCode, deletePromoCode } from "@/actions/promo";

interface PromoActionsProps {
  id: string;
  isActive: boolean;
  usedCount: number;
}

export function PromoActions({ id, isActive, usedCount }: PromoActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await togglePromoCode(id);
        toast({ title: isActive ? "Code deactivated" : "Code activated" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePromoCode(id);
        toast({ title: "Code deleted" });
      } catch (err: any) {
        toast({ title: "Cannot delete", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}
        title={isActive ? "Deactivate" : "Activate"}
      >
        <Power className="h-4 w-4" />
      </Button>
      {usedCount === 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-500 hover:text-red-600"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
