"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Users, User, Mail, Phone, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createHotelBooking } from "@/actions/booking";
import { hotelBookingSchema, type HotelBookingInput } from "@/validations";
import { PromoCodeInput } from "@/components/bookings/promo-code-input";
import { formatCurrency, getNightCount } from "@/lib/utils";
import type { Room } from "@prisma/client";

interface HotelBookingWidgetProps {
  listing: { id: string; title: string };
  rooms: Room[];
}

export function HotelBookingWidget({ listing, rooms }: HotelBookingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"search" | "room" | "details">("search");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [appliedPromo, setAppliedPromo] = useState<{ id: string; discount: number; code: string } | null>(null);

  const nights = checkIn && checkOut ? getNightCount(new Date(checkIn), new Date(checkOut)) : 0;
  const subtotal = selectedRoom ? selectedRoom.pricePerNight * nights : 0;
  const platformFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.08);
  const total = Math.max(0, subtotal + platformFee + taxes - (appliedPromo?.discount ?? 0));

  const { register, handleSubmit, formState: { errors } } = useForm<HotelBookingInput>({
    resolver: zodResolver(hotelBookingSchema),
    defaultValues: { guests },
  });

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      toast({ title: "Please select check-in and check-out dates", variant: "destructive" });
      return;
    }
    if (nights <= 0) {
      toast({ title: "Check-out must be after check-in", variant: "destructive" });
      return;
    }
    setStep("room");
  };

  const availableRooms = rooms.filter((r) => r.maxGuests >= guests);

  const onSubmit = async (data: Omit<HotelBookingInput, "roomId" | "checkIn" | "checkOut">) => {
    if (!selectedRoom) return;
    startTransition(async () => {
      try {
        const result = await createHotelBooking({
          ...data,
          listingId: listing.id,
          roomId: selectedRoom.id,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guests,
          promoCodeId: appliedPromo?.id,
          discountAmount: appliedPromo?.discount ?? 0,
        });
        if (result.checkoutUrl) router.push(result.checkoutUrl);
      } catch (error: any) {
        toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-5 text-white">
        <p className="text-sm opacity-90">Starting from</p>
        <p className="text-3xl font-bold">{formatCurrency(Math.min(...rooms.map((r) => r.pricePerNight)))}</p>
        <p className="text-sm opacity-80 mt-1">per night</p>
      </div>

      <div className="p-5">
        {step === "search" && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Check-in</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Check-out</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                  max={20}
                  className="pl-9"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </div>
            </div>
            <Button onClick={handleSearch} className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
              Search Availability
            </Button>
          </div>
        )}

        {step === "room" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Select a room</h3>
              <button onClick={() => setStep("search")} className="text-xs text-blue-500">
                Change dates
              </button>
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
              {checkIn} → {checkOut} · {nights} night{nights !== 1 ? "s" : ""} · {guests} guest{guests !== 1 ? "s" : ""}
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {availableRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => { setSelectedRoom(room); setStep("details"); }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedRoom?.id === room.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{room.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">{room.type}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="h-3 w-3" /> {room.maxGuests}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(room.pricePerNight * nights)}</p>
                      <p className="text-xs text-gray-400">{formatCurrency(room.pricePerNight)}/night</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your details</h3>
              <button onClick={() => setStep("room")} className="text-xs text-blue-500">
                Change room
              </button>
            </div>

            {selectedRoom && (
              <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3">
                <Bed className="h-4 w-4 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{selectedRoom.name}</p>
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

            {selectedRoom && nights > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(selectedRoom.pricePerNight)} × {nights} nights</span>
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
                {appliedPromo && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promo ({appliedPromo.code})</span>
                    <span>-{formatCurrency(appliedPromo.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <PromoCodeInput
                  subtotal={subtotal}
                  listingId={listing.id}
                  onApply={(id, discount, code) => setAppliedPromo({ id, discount, code })}
                  onRemove={() => setAppliedPromo(null)}
                  appliedCode={appliedPromo?.code}
                />
              </div>
            )}

            <Button type="submit" loading={isPending} className="w-full bg-blue-500 hover:bg-blue-600 text-white" size="lg">
              {isPending ? "Processing..." : "Reserve Now"}
            </Button>
            <p className="text-xs text-center text-gray-400">Free cancellation within 24 hours</p>
          </form>
        )}
      </div>
    </div>
  );
}
