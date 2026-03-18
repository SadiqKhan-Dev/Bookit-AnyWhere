"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { toggleWishlist } from "@/actions/wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
}

export function WishlistButton({ listingId, initialSaved = false, className }: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        const result = await toggleWishlist(listingId);
        setSaved(result.saved);
        toast({
          title: result.saved ? "Saved to wishlist" : "Removed from wishlist",
          description: result.saved ? "You can find it in your wishlist." : undefined,
        });
        router.refresh();
      } catch (err: any) {
        if (err.message?.includes("sign in")) {
          router.push("/sign-in");
        } else {
          toast({ title: "Something went wrong", variant: "destructive" });
        }
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-all disabled:opacity-50",
        className
      )}
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          saved ? "fill-rose-500 text-rose-500" : "text-gray-600 hover:text-rose-500"
        )}
      />
    </button>
  );
}
