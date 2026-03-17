import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, addDays, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// CURRENCY
// ============================================================

export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

// ============================================================
// DATE / TIME
// ============================================================

export function formatDate(date: Date | string, fmt = "MMM d, yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
}

export function getNightCount(checkIn: Date, checkOut: Date): number {
  return differenceInDays(checkOut, checkIn);
}

export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  slotDurationMin: number
): string[] {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);

  let currentMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  while (currentMinutes < closeMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    currentMinutes += slotDurationMin;
  }

  return slots;
}

export function formatTime12h(time24: string): string {
  const [hourStr, min] = time24.split(":");
  const hour = parseInt(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${min} ${period}`;
}

export function getDayOfWeek(date: Date): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[date.getDay()];
}

// ============================================================
// STRING UTILITIES
// ============================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ============================================================
// LISTING TYPE HELPERS
// ============================================================

export const LISTING_TYPE_CONFIG = {
  SALON: {
    label: "Salon",
    color: "salon",
    bgColor: "bg-pink-50",
    textColor: "text-pink-600",
    borderColor: "border-pink-200",
    icon: "scissors",
    plural: "Salons",
    description: "Hair, beauty & wellness services",
    href: "/salons",
  },
  HOTEL: {
    label: "Hotel",
    color: "hotel",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
    icon: "building-2",
    plural: "Hotels",
    description: "Rooms, suites & accommodations",
    href: "/hotels",
  },
  MEDICAL: {
    label: "Medical",
    color: "medical",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-200",
    icon: "stethoscope",
    plural: "Clinics",
    description: "Doctors, specialists & health",
    href: "/doctors",
  },
} as const;

export type ListingTypeKey = keyof typeof LISTING_TYPE_CONFIG;

// ============================================================
// BOOKING STATUS HELPERS
// ============================================================

export const BOOKING_STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-800" },
  NO_SHOW: { label: "No Show", color: "bg-gray-100 text-gray-800" },
};

// ============================================================
// RATING
// ============================================================

export function getRatingLabel(rating: number): string {
  if (rating >= 4.8) return "Exceptional";
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4.0) return "Very Good";
  if (rating >= 3.5) return "Good";
  return "Fair";
}

// ============================================================
// URL HELPERS
// ============================================================

export function buildSearchUrl(type: string, params: Record<string, string>): string {
  const base = `/${type.toLowerCase()}s`;
  const searchParams = new URLSearchParams(params);
  return `${base}?${searchParams.toString()}`;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
