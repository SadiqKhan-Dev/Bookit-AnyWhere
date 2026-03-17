"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, User, Mail, Phone, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createSalonBooking } from "@/actions/booking";
import { getAvailableSlots } from "@/actions/booking";
import { salonBookingSchema, type SalonBookingInput } from "@/validations";
import { formatCurrency, formatTime12h } from "@/lib/utils";
import type { Service, AvailabilityRule } from "@prisma/client";

interface SalonBookingWidgetProps {
  listing: { id: string; title: string; type: string };
  services: Service[];
  availability: AvailabilityRule[];
}

export function SalonBookingWidget({ listing, services, availability }: SalonBookingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<"service" | "datetime" | "details">("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<{ time: string; isTaken: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalonBookingInput>({
    resolver: zodResolver(salonBookingSchema),
  });

  const handleDateChange = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime("");
    if (!dateStr || !selectedService) return;

    setLoadingSlots(true);
    try {
      const result = await getAvailableSlots(listing.id, new Date(dateStr));
      setSlots(result);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onSubmit = async (data: Omit<SalonBookingInput, "serviceId" | "date" | "time">) => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    startTransition(async () => {
      try {
        const result = await createSalonBooking({
          ...data,
          listingId: listing.id,
          serviceId: selectedService.id,
          date: new Date(selectedDate),
          time: selectedTime,
        });

        if (result.checkoutUrl) {
          router.push(result.checkoutUrl);
        }
      } catch (error: any) {
        toast({
          title: "Booking failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const fees = selectedService ? calculateFees(selectedService.price) : null;

  const availableDays = availability
    .filter((r) => r.isOpen)
    .map((r) => r.dayOfWeek.toLowerCase().slice(0, 3));

  return (
    <div className="rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-5 text-white">
        <p className="text-sm font-medium opacity-90">From</p>
        <p className="text-3xl font-bold">
          {formatCurrency(
            selectedService?.price ?? Math.min(...services.map((s) => s.price))
          )}
        </p>
        <p className="text-sm opacity-80 mt-1">per service • includes taxes</p>
      </div>

      {/* Steps indicator */}
      <div className="flex border-b">
        {(["service", "datetime", "details"] as const).map((s, i) => (
          <button
            key={s}
            onClick={() => step !== "service" && setStep(s)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              step === s
                ? "text-pink-600 border-b-2 border-pink-500"
                : i < ["service", "datetime", "details"].indexOf(step)
                ? "text-gray-500 hover:text-pink-500"
                : "text-gray-300 cursor-not-allowed"
            }`}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Service */}
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-gray-900">Select a service</h3>
              {services.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => {
                    setSelectedService(svc);
                    setStep("datetime");
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                    selectedService?.id === svc.id
                      ? "border-pink-500 bg-pink-50"
                      : "border-gray-100 hover:border-pink-200 hover:bg-pink-50/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{svc.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{svc.durationMin} min</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{formatCurrency(svc.price)}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* STEP 2: Select Date & Time */}
          {step === "datetime" && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Pick date & time</h3>
                {selectedService && (
                  <Badge variant="salon" className="text-xs">
                    {selectedService.name}
                  </Badge>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Select date
                </Label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Available times
                  </Label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No available slots for this date
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map(({ time, isTaken }) => (
                        <button
                          key={time}
                          disabled={isTaken}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 text-sm rounded-lg border font-medium transition-all ${
                            isTaken
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                              : selectedTime === time
                              ? "bg-pink-500 text-white border-pink-500"
                              : "border-gray-200 text-gray-700 hover:border-pink-300 hover:text-pink-600"
                          }`}
                        >
                          {formatTime12h(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => setStep("details")}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Guest Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <h3 className="font-semibold text-gray-900 mb-4">Your details</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-sm">Full name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      className="pl-9"
                      placeholder="Jane Smith"
                      {...register("guestName")}
                    />
                  </div>
                  {errors.guestName && (
                    <p className="text-xs text-red-500 mt-1">{errors.guestName.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm">Email address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      className="pl-9"
                      placeholder="jane@example.com"
                      {...register("guestEmail")}
                    />
                  </div>
                  {errors.guestEmail && (
                    <p className="text-xs text-red-500 mt-1">{errors.guestEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm">Phone (optional)</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="tel"
                      className="pl-9"
                      placeholder="+1 555 000 0000"
                      {...register("guestPhone")}
                    />
                  </div>
                </div>

                {/* Price Summary */}
                {fees && selectedService && (
                  <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm mt-2">
                    <div className="flex justify-between text-gray-600">
                      <span>{selectedService.name}</span>
                      <span>{formatCurrency(selectedService.price)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Platform fee (10%)</span>
                      <span>{formatCurrency(fees.platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes (8%)</span>
                      <span>{formatCurrency(fees.taxes)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(fees.total)}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={isPending}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold"
                  size="lg"
                >
                  {isPending ? "Processing..." : "Book & Pay"}
                </Button>

                <p className="text-xs text-center text-gray-400">
                  You won't be charged until the booking is confirmed
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function calculateFees(price: number) {
  const platformFee = Math.round(price * 0.1);
  const taxes = Math.round(price * 0.08);
  const total = price + platformFee + taxes;
  return { platformFee, taxes, total };
}
