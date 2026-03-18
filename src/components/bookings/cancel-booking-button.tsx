"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cancelBooking } from "@/actions/booking";

interface CancelBookingButtonProps {
  bookingId: string;
  isPaid: boolean;
}

export function CancelBookingButton({ bookingId, isPaid }: CancelBookingButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelBooking(bookingId);
        setOpen(false);
        toast({
          title: "Booking cancelled",
          description: isPaid
            ? "A refund will be processed to your original payment method within 5–10 business days."
            : "Your booking has been cancelled.",
        });
        router.refresh();
      } catch (err: any) {
        toast({ title: "Failed to cancel", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
        onClick={() => setOpen(true)}
      >
        <XCircle className="h-4 w-4" />
        Cancel booking
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription className="text-left">
              {isPaid
                ? "You've already paid for this booking. Cancelling will initiate a refund to your original payment method. This may take 5–10 business days."
                : "This will permanently cancel your booking. This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending} className="flex-1">
              Keep booking
            </Button>
            <Button
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "Cancelling..." : "Yes, cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
