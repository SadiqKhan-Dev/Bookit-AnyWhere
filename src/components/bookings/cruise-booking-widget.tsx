"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, User, Mail, Phone, Ship, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createCruiseBooking } from "@/actions/booking";
import { cruiseBookingSchema, type CruiseBookingInput } from "@/validations";
import { formatCurrency, getNightCount } from "@/lib/utils";
import type { CruiseCabin } from "@prisma/client";

interface CruiseBookingWidgetProps {
  listing: { id: string; title: string };
  cabins: CruiseCabin[];
}

export function CruiseBookingWidget({ listing, cabins }: CruiseBookingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"search" | "cabin" | "details">("search");
  const [selectedCabin, setSelectedCabin] = useState<CruiseCabin | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const nights = checkIn && checkOut ? getNightCount(new Date(checkIn), new Date(checkOut)) : 0;
  const subtotal = selectedCabin ? selectedCabin.pricePerNight * nights : 0;
  const platformFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.08);
  const total = subtotal + platformFee + taxes;

  const { register, handleSubmit, formState: { errors } } = useForm<CruiseBookingInput>({
    resolver: zodResolver(cruiseBookingSchema),
    defaultValues: { guests },
  });

  const availableCabins = cabins.filter((c) => c.isAvailable && c.maxGuests >= guests);

  const onSubmit = async (data: Omit<CruiseBookingInput, "cruiseCabinId" | "checkIn" | "checkOut">) => {
    if (!selectedCabin) return;
    startTransition(async () => {
      try {
        const result = await createCruiseBooking({
          ...data,
          listingId: listing.id,
          cruiseCabinId: selectedCabin.id,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guests,
        });
        if (result.checkoutUrl) router.push(result.checkoutUrl);
      } catch (error: any) {
        toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-5 text-white">
        <p className="text-sm opacity-90">Starting from</p>
        <p className="text-3xl font-bold">{formatCurrency(Math.min(...cabins.map((c) => c.pricePerNight)))}</p>
        <p className="text-sm opacity-80 mt-1">per night</p>
      </div>

      <div className="p-5">
        {step === "search" && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Embarkation date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Disembarkation date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Guests</Label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  min={1}
                  max={8}
                  className="pl-9"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                if (!checkIn || !checkOut) { toast({ title: "Please select embarkation and disembarkation dates", variant: "destructive" }); return; }
                if (nights <= 0) { toast({ title: "Disembarkation must be after embarkation", variant: "destructive" }); return; }
                setStep("cabin");
              }}
              className="w-full bg-teal-500 hover:bg-teal-600"
              size="lg"
            >
              Search Cabins
            </Button>
          </div>
        )}

        {step === "cabin" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Select a cabin</h3>
              <button onClick={() => setStep("search")} className="text-xs text-teal-500">Change dates</button>
            </div>
            <div className="text-xs text-gray-500 bg-teal-50 rounded-lg p-3">
              {checkIn} → {checkOut} · {nights} night{nights !== 1 ? "s" : ""} · {guests} guest{guests !== 1 ? "s" : ""}
            </div>
            {availableCabins.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No cabins available for {guests} guests.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {availableCabins.map((cabin) => (
                  <button
                    key={cabin.id}
                    onClick={() => { setSelectedCabin(cabin); setStep("details"); }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedCabin?.id === cabin.id ? "border-teal-500 bg-teal-50" : "border-gray-100 hover:border-teal-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{cabin.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className="bg-teal-100 text-teal-700 text-xs border-0">{cabin.type.replace("_", " ")}</Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" /> {cabin.maxGuests}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(cabin.pricePerNight * nights)}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(cabin.pricePerNight)}/night</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your details</h3>
              <button onClick={() => setStep("cabin")} className="text-xs text-teal-500">Change cabin</button>
            </div>

            {selectedCabin && (
              <div className="bg-teal-50 rounded-xl p-3 flex items-center gap-3">
                <Ship className="h-4 w-4 text-teal-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{selectedCabin.name}</p>
                  <p className="text-xs text-gray-500">{nights} night{nights !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="text-sm">Full name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9" placeholder="John Doe" {...register("guestName")} />
              </div>
              {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName.message}</p>}
            </div>

            <div>
              <Label className="text-sm">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" className="pl-9" placeholder="john@example.com" {...register("guestEmail")} />
              </div>
              {errors.guestEmail && <p className="text-xs text-red-500 mt-1">{errors.guestEmail.message}</p>}
            </div>

            <div>
              <Label className="text-sm">Phone</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="tel" className="pl-9" placeholder="+1 555 000 0000" {...register("guestPhone")} />
              </div>
            </div>

            {selectedCabin && nights > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(selectedCabin.pricePerNight)} × {nights} nights</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Platform fee (10%)</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (8%)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            )}

            <Button type="submit" loading={isPending} className="w-full bg-teal-500 hover:bg-teal-600 text-white" size="lg">
              {isPending ? "Processing..." : "Reserve Cabin"}
            </Button>
            <p className="text-xs text-center text-gray-400">Free cancellation within 48 hours</p>
          </form>
        )}
      </div>
    </div>
  );
}
