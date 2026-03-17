"use client";

import { useTransition } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { confirmBooking, cancelBooking } from "@/actions/booking";

interface ProviderBookingActionsProps {
  booking: {
    id: string;
    status: string;
    customerId: string;
  };
}

export function ProviderBookingActions({ booking }: ProviderBookingActionsProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        await confirmBooking(booking.id);
        toast({ title: "Booking confirmed!", description: "Customer has been notified." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelBooking(booking.id);
        toast({ title: "Booking cancelled", description: "Refund will be processed if applicable." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  if (booking.status !== "PENDING") return null;

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={handleConfirm}
        disabled={isPending}
        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
      >
        <CheckCircle className="h-3.5 w-3.5" />
        Confirm
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCancel}
        disabled={isPending}
        className="text-red-500 border-red-200 hover:bg-red-50 gap-1"
      >
        <XCircle className="h-3.5 w-3.5" />
        Decline
      </Button>
    </div>
  );
}
