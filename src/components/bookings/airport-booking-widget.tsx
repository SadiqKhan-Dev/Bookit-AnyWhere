"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, User, Mail, Phone, PlaneLanding, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createAirportBooking } from "@/actions/booking";
import { airportBookingSchema, type AirportBookingInput } from "@/validations";
import { PromoCodeInput } from "@/components/bookings/promo-code-input";
import { formatCurrency } from "@/lib/utils";
import type { Service } from "@prisma/client";

interface AirportBookingWidgetProps {
  listing: { id: string; title: string };
  services: Service[];
}

export function AirportBookingWidget({ listing, services }: AirportBookingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [appliedPromo, setAppliedPromo] = useState<{ id: string; discount: number; code: string } | null>(null);

  const subtotal = selectedService ? selectedService.price * passengers : 0;
  const platformFee = Math.round(subtotal * 0.1);
  const taxes = Math.round(subtotal * 0.08);
  const total = Math.max(0, subtotal + platformFee + taxes - (appliedPromo?.discount ?? 0));

  const { register, handleSubmit, formState: { errors } } = useForm<AirportBookingInput>({
    resolver: zodResolver(airportBookingSchema),
    defaultValues: { passengers: 1 },
  });

  const onSubmit = async (data: Omit<AirportBookingInput, "serviceId" | "date" | "time">) => {
    if (!selectedService || !date || !time) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    startTransition(async () => {
      try {
        const result = await createAirportBooking({
          ...data,
          listingId: listing.id,
          serviceId: selectedService.id,
          date: new Date(date),
          time,
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
      <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-5 text-white">
        <p className="text-sm opacity-90">Starting from</p>
        <p className="text-3xl font-bold">{formatCurrency(Math.min(...services.map((s) => s.price)))}</p>
        <p className="text-sm opacity-80 mt-1">per person</p>
      </div>

      <div className="p-5">
        {step === "select" && (
          <div className="space-y-4">
            <h3 className="font-semibold">Select a service</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedService?.id === service.id ? "border-sky-500 bg-sky-50" : "border-gray-100 hover:border-sky-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      {service.category && (
                        <Badge className="bg-sky-100 text-sky-700 text-xs border-0 mt-0.5">{service.category}</Badge>
                      )}
                    </div>
                    <p className="font-bold text-sm">{formatCurrency(service.price)}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedService && (
              <>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <input
                    type="time"
                    className="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 mt-1"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Passengers</Label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      className="pl-9"
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!date || !time) { toast({ title: "Please select date and time", variant: "destructive" }); return; }
                    setStep("details");
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-600"
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
              <button onClick={() => setStep("select")} className="text-xs text-sky-500">Change service</button>
            </div>

            {selectedService && (
              <div className="bg-sky-50 rounded-xl p-3 flex items-center gap-3">
                <PlaneLanding className="h-4 w-4 text-sky-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{selectedService.name}</p>
                  <p className="text-xs text-gray-500">{date} at {time} · {passengers} passenger{passengers !== 1 ? "s" : ""}</p>
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

            <div>
              <Label className="text-sm">Flight number (optional)</Label>
              <Input placeholder="e.g. AA 123" {...register("flightNumber")} />
            </div>

            {selectedService && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(selectedService.price)} × {passengers} passenger{passengers !== 1 ? "s" : ""}</span>
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

            <Button type="submit" loading={isPending} className="w-full bg-sky-500 hover:bg-sky-600 text-white" size="lg">
              {isPending ? "Processing..." : "Book Now"}
            </Button>
            <p className="text-xs text-center text-gray-400">Free cancellation within 24 hours</p>
          </form>
        )}
      </div>
    </div>
  );
}
