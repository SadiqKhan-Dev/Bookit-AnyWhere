"use client";

import { useTransition } from "react";
import { Power, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { toggleListingActive, toggleListingFeatured } from "@/actions/admin";

interface ListingToggleProps {
  id: string;
  isActive: boolean;
  isFeatured: boolean;
}

export function ListingToggle({ id, isActive, isFeatured }: ListingToggleProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleActive = () => {
    startTransition(async () => {
      try {
        await toggleListingActive(id);
        toast({ title: isActive ? "Listing deactivated" : "Listing activated" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  const handleFeatured = () => {
    startTransition(async () => {
      try {
        await toggleListingFeatured(id);
        toast({ title: isFeatured ? "Removed from featured" : "Marked as featured" });
      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleActive}
        disabled={isPending}
        className={isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}
        title={isActive ? "Deactivate" : "Activate"}
      >
        <Power className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFeatured}
        disabled={isPending}
        className={isFeatured ? "text-rose-500 hover:text-rose-600" : "text-gray-400 hover:text-rose-500"}
        title={isFeatured ? "Remove from featured" : "Mark as featured"}
      >
        <Star className="h-4 w-4" />
      </Button>
    </div>
  );
}
