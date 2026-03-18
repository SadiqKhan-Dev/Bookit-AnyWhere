"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Clock, User, Mail, Phone, Video, UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { createMedicalBooking } from "@/actions/booking";
import { getAvailableSlots } from "@/actions/booking";
import { medicalBookingSchema, type MedicalBookingInput } from "@/validations";
import { PromoCodeInput } from "@/components/bookings/promo-code-input";
import { formatCurrency, formatTime12h } from "@/lib/utils";
import type { Service, Doctor, AvailabilityRule } from "@prisma/client";

interface MedicalBookingWidgetProps {
  listing: { id: string; title: string };
  services: Service[];
  doctors: Doctor[];
  availability: AvailabilityRule[];
}

export function MedicalBookingWidget({ listing, services, doctors, availability }: MedicalBookingWidgetProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<"service" | "datetime" | "details">("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState<"IN_PERSON" | "TELEMEDICINE">("IN_PERSON");
  const [slots, setSlots] = useState<{ time: string; isTaken: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{ id: string; discount: number; code: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<MedicalBookingInput>({
    resolver: zodResolver(medicalBookingSchema),
  });

  const handleDateChange = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime("");
    if (!dateStr) return;
    setLoadingSlots(true);
    try {
      const result = await getAvailableSlots(listing.id, new Date(dateStr));
      setSlots(result);
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const fees = selectedService ? {
    platformFee: Math.round(selectedService.price * 0.1),
    taxes: Math.round(selectedService.price * 0.08),
    total: Math.max(0, selectedService.price + Math.round(selectedService.price * 0.18) - (appliedPromo?.discount ?? 0)),
  } : null;

  const onSubmit = async (data: Omit<MedicalBookingInput, "serviceId" | "doctorId" | "date" | "time" | "appointmentType">) => {
    if (!selectedService || !selectedDate || !selectedTime) return;
    startTransition(async () => {
      try {
        const result = await createMedicalBooking({
          ...data,
          listingId: listing.id,
          serviceId: selectedService.id,
          doctorId: selectedDoctor?.id,
          date: new Date(selectedDate),
          time: selectedTime,
          appointmentType,
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
      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-5 text-white">
        <p className="text-sm opacity-90">From</p>
        <p className="text-3xl font-bold">{formatCurrency(Math.min(...services.map(s => s.price)))}</p>
        <p className="text-sm opacity-80 mt-1">per consultation</p>
      </div>

      <div className="flex border-b">
        {(["service", "datetime", "details"] as const).map((s, i) => (
          <button
            key={s}
            onClick={() => i < ["service", "datetime", "details"].indexOf(step) + 1 && setStep(s)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              step === s ? "text-emerald-600 border-b-2 border-emerald-500" : i < ["service", "datetime", "details"].indexOf(step) ? "text-gray-500 hover:text-emerald-500" : "text-gray-300"
            }`}
          >
            {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {step === "service" && (
            <motion.div key="service" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <h3 className="font-semibold text-gray-900">Select service</h3>

              {/* Appointment Type */}
              <div>
                <Label className="text-sm text-gray-500 mb-2 block">Appointment type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["IN_PERSON", "TELEMEDICINE"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAppointmentType(type)}
                      className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        appointmentType === type ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 text-gray-500 hover:border-emerald-200"
                      }`}
                    >
                      {type === "TELEMEDICINE" ? <Video className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                      {type === "IN_PERSON" ? "In-Person" : "Video Call"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Doctor */}
              {doctors.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-500 mb-2 block">Select doctor (optional)</Label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedDoctor(null)}
                      className={`w-full text-left p-2.5 rounded-xl border-2 text-sm transition-all ${!selectedDoctor ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"}`}
                    >
                      Any available doctor
                    </button>
                    {doctors.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc)}
                        className={`w-full text-left p-2.5 rounded-xl border-2 transition-all ${selectedDoctor?.id === doc.id ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"}`}
                      >
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-emerald-600">{doc.specialty}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service */}
              <div className="space-y-2">
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => { setSelectedService(svc); setStep("datetime"); }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      selectedService?.id === svc.id ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{svc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{svc.durationMin} min</p>
                      </div>
                      <p className="font-bold">{formatCurrency(svc.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "datetime" && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
              <h3 className="font-semibold text-gray-900">Pick date & time</h3>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Date</Label>
                <input type="date" min={new Date().toISOString().split("T")[0]} className="w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-300 outline-none" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} />
              </div>
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Time slot</Label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-9 rounded-lg bg-gray-100 animate-pulse" />)}</div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-center text-gray-500 py-4">No slots available</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map(({ time, isTaken }) => (
                        <button key={time} disabled={isTaken} onClick={() => setSelectedTime(time)}
                          className={`py-2 text-sm rounded-lg border font-medium transition-all ${isTaken ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" : selectedTime === time ? "bg-emerald-500 text-white border-emerald-500" : "border-gray-200 text-gray-700 hover:border-emerald-300"}`}>
                          {formatTime12h(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <Button onClick={() => setStep("details")} disabled={!selectedDate || !selectedTime} className="w-full bg-emerald-500 hover:bg-emerald-600">Continue</Button>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div key="details" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <h3 className="font-semibold mb-4">Your details</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label className="text-sm">Full name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input className="pl-9" placeholder="Jane Smith" {...register("guestName")} />
                  </div>
                  {errors.guestName && <p className="text-xs text-red-500 mt-1">{errors.guestName.message}</p>}
                </div>
                <div>
                  <Label className="text-sm">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type="email" className="pl-9" placeholder="jane@example.com" {...register("guestEmail")} />
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
                {fees && selectedService && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600"><span>{selectedService.name}</span><span>{formatCurrency(selectedService.price)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Platform fee (10%)</span><span>{formatCurrency(fees.platformFee)}</span></div>
                    <div className="flex justify-between text-gray-600"><span>Taxes (8%)</span><span>{formatCurrency(fees.taxes)}</span></div>
                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Promo ({appliedPromo.code})</span>
                        <span>-{formatCurrency(appliedPromo.discount)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold text-gray-900"><span>Total</span><span>{formatCurrency(fees.total)}</span></div>
                    <PromoCodeInput
                      subtotal={selectedService.price}
                      listingId={listing.id}
                      onApply={(id, discount, code) => setAppliedPromo({ id, discount, code })}
                      onRemove={() => setAppliedPromo(null)}
                      appliedCode={appliedPromo?.code}
                    />
                  </div>
                )}
                <Button type="submit" loading={isPending} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" size="lg">
                  {isPending ? "Processing..." : "Book Appointment"}
                </Button>
                <p className="text-xs text-center text-gray-400">No charge until confirmed</p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
