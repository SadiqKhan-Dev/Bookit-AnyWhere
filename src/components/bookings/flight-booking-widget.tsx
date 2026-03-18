"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, User, Mail, Phone, Plane, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createFlightBooking } from "@/actions/booking";
import { flightBookingSchema, type FlightBookingInput } from "@/validations";
import { PromoCodeInput } from "@/components/bookings/promo-code-input";
import { formatCurrency } from "@/lib/utils";
import type { FlightRoute, FlightSeat } from "@prisma/client";

type FlightRouteWithSeats = FlightRoute & { seats: FlightSeat[] };

interface FlightBookingWidgetProps {
  listing: { id: string; title: string };
  flightRoutes: FlightRouteWithSeats[];
}

export function FlightBookingWidget({ listing, flightRoutes }: FlightBookingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedRoute, setSelectedRoute] = useState<FlightRouteWithSeats | null>(
    flightRoutes.length === 1 ? flightRoutes[0] : null
  );
  const [selectedSeat, setSelectedSeat] = useState<FlightSeat | null>(null);
  const [departureDate, setDepartureDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<{ id: string; discount: number; code: string } | null>(null);

  const subtotal = selectedSeat ? selectedSeat.pricePerSeat * passengers : 0;
  const platformFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.08);
  const total = Math.max(0, subtotal + platformFee + taxes - (appliedPromo?.discount ?? 0));

  const allSeats = flightRoutes.flatMap((r) => r.seats);
  const minPrice = allSeats.length > 0 ? Math.min(...allSeats.map((s) => s.pricePerSeat)) : 0;

  const { register, handleSubmit, formState: { errors } } = useForm<FlightBookingInput>({
    resolver: zodResolver(flightBookingSchema),
    defaultValues: { passengers: 1 },
  });

  const onSubmit = async (data: Omit<FlightBookingInput, "flightSeatId" | "departureDate">) => {
    if (!selectedSeat || !departureDate) {
      toast({ title: "Please select a seat class and departure date", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const result = await createFlightBooking({
          ...data,
          listingId: listing.id,
          flightSeatId: selectedSeat.id,
          departureDate: new Date(departureDate),
          passengers,
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
      <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-5 text-white">
        <p className="text-sm opacity-90">Starting from</p>
        <p className="text-3xl font-bold">{minPrice > 0 ? formatCurrency(minPrice) : "—"}</p>
        <p className="text-sm opacity-80 mt-1">per seat</p>
      </div>

      <div className="p-5">
        {step === "select" && (
          <div className="space-y-4">
            {/* Route picker (if multiple routes) */}
            {flightRoutes.length > 1 && (
              <div>
                <Label className="text-sm font-medium">Select route</Label>
                <div className="space-y-2 mt-2">
                  {flightRoutes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => { setSelectedRoute(route); setSelectedSeat(null); }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedRoute?.id === route.id ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-violet-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{route.origin} → {route.destination}</span>
                        <span className="text-gray-500">{route.departureTime}</span>
                      </div>
                      <p className="text-xs text-gray-400">{route.airline} · {route.flightNumber}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Seat Class picker */}
            {selectedRoute && (
              <>
                <div>
                  <Label className="text-sm font-medium">Select seat class</Label>
                  <div className="space-y-2 mt-2">
                    {selectedRoute.seats.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => setSelectedSeat(seat)}
                        disabled={seat.availableSeats === 0}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          selectedSeat?.id === seat.id ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-violet-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{seat.name}</p>
                            <p className="text-xs text-gray-500">
                              {seat.availableSeats > 0 ? `${seat.availableSeats} seats left` : "Sold out"}
                            </p>
                          </div>
                          <p className="font-bold text-sm">{formatCurrency(seat.pricePerSeat)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Departure date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Passengers</Label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      min={1}
                      max={9}
                      className="pl-9"
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (!selectedSeat) { toast({ title: "Please select a seat class", variant: "destructive" }); return; }
                    if (!departureDate) { toast({ title: "Please select a departure date", variant: "destructive" }); return; }
                    setStep("details");
                  }}
                  className="w-full bg-violet-500 hover:bg-violet-600"
                  size="lg"
                >
                  Continue
                </Button>
              </>
            )}
          </div>
        )}

        {step === "details" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your details</h3>
              <button onClick={() => setStep("select")} className="text-xs text-violet-500">Change selection</button>
            </div>

            {selectedSeat && selectedRoute && (
              <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-3">
                <Plane className="h-4 w-4 text-violet-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{selectedRoute.origin} → {selectedRoute.destination} · {selectedSeat.name}</p>
                  <p className="text-xs text-gray-500">{departureDate} · {passengers} passenger{passengers !== 1 ? "s" : ""}</p>
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

            {selectedSeat && passengers > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(selectedSeat.pricePerSeat)} × {passengers} seat{passengers !== 1 ? "s" : ""}</span>
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

            <Button type="submit" loading={isPending} className="w-full bg-violet-500 hover:bg-violet-600 text-white" size="lg">
              {isPending ? "Processing..." : "Book Flight"}
            </Button>
            <p className="text-xs text-center text-gray-400">Seats held for 24 hours after booking</p>
          </form>
        )}
      </div>
    </div>
  );
}
