import { z } from "zod";

// ============================================================
// LISTING SCHEMAS
// ============================================================

export const createListingSchema = z.object({
  type: z.enum(["SALON", "HOTEL", "MEDICAL", "AIRPORT", "FLIGHT", "CRUISE"]),
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().default("US"),
  zipCode: z.string().min(4),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  coverImage: z.string().url("Please upload a cover image"),
  images: z.array(z.string().url()).max(10),
  priceFrom: z.number().positive("Price must be positive"),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial();
export type UpdateListingInput = z.infer<typeof updateListingSchema>;

// ============================================================
// SERVICE SCHEMAS
// ============================================================

export const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  durationMin: z.number().int().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours"),
  price: z.number().positive(),
  category: z.string().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

// ============================================================
// ROOM SCHEMAS
// ============================================================

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1),
  type: z.enum(["SINGLE", "DOUBLE", "TWIN", "SUITE", "DELUXE", "PENTHOUSE"]),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  floor: z.number().int().optional(),
  maxGuests: z.number().int().min(1).max(20),
  pricePerNight: z.number().positive(),
  images: z.array(z.string().url()).max(10),
  amenities: z.array(z.string()),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;

// ============================================================
// BOOKING SCHEMAS
// ============================================================

const promoFields = {
  promoCodeId: z.string().optional(),
  discountAmount: z.number().int().min(0).optional(),
};

const baseBookingSchema = z.object({
  listingId: z.string().cuid(),
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email"),
  guestPhone: z.string().optional(),
  notes: z.string().max(500).optional(),
  ...promoFields,
});

export const hotelBookingSchema = baseBookingSchema.extend({
  roomId: z.string().cuid("Please select a room"),
  checkIn: z.date({ required_error: "Check-in date is required" }),
  checkOut: z.date({ required_error: "Check-out date is required" }),
  guests: z.number().int().min(1).max(20),
}).refine(
  (data) => data.checkOut > data.checkIn,
  { message: "Check-out must be after check-in", path: ["checkOut"] }
);

export const salonBookingSchema = baseBookingSchema.extend({
  serviceId: z.string().cuid("Please select a service"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please select a time slot"),
});

export const medicalBookingSchema = baseBookingSchema.extend({
  serviceId: z.string().cuid("Please select a service"),
  doctorId: z.string().cuid().optional(),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please select a time slot"),
  appointmentType: z.enum(["IN_PERSON", "TELEMEDICINE"]),
});

export type HotelBookingInput = z.infer<typeof hotelBookingSchema>;
export type SalonBookingInput = z.infer<typeof salonBookingSchema>;
export type MedicalBookingInput = z.infer<typeof medicalBookingSchema>;

// ============================================================
// PROMO CODE SCHEMA
// ============================================================

export const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20),
  description: z.string().max(100).optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.date().optional(),
  listingId: z.string().cuid().optional(),
});
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeSchema>;

// ============================================================
// REVIEW SCHEMA
// ============================================================

export const createReviewSchema = z.object({
  bookingId: z.string().cuid(),
  listingId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ============================================================
// SEARCH SCHEMA
// ============================================================

export const airportBookingSchema = baseBookingSchema.extend({
  serviceId: z.string().cuid("Please select a service"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Please select a time slot"),
  passengers: z.number().int().min(1).max(20).default(1),
  flightNumber: z.string().optional(),
});

export const flightBookingSchema = baseBookingSchema.extend({
  flightSeatId: z.string().cuid("Please select a seat class"),
  departureDate: z.date({ required_error: "Please select a departure date" }),
  passengers: z.number().int().min(1).max(9).default(1),
});

export const cruiseBookingSchema = baseBookingSchema.extend({
  cruiseCabinId: z.string().cuid("Please select a cabin"),
  checkIn: z.date({ required_error: "Embarkation date is required" }),
  checkOut: z.date({ required_error: "Disembarkation date is required" }),
  guests: z.number().int().min(1).max(8),
}).refine(
  (data) => data.checkOut > data.checkIn,
  { message: "Disembarkation must be after embarkation", path: ["checkOut"] }
);

export type AirportBookingInput = z.infer<typeof airportBookingSchema>;
export type FlightBookingInput = z.infer<typeof flightBookingSchema>;
export type CruiseBookingInput = z.infer<typeof cruiseBookingSchema>;

export const searchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(["SALON", "HOTEL", "MEDICAL", "AIRPORT", "FLIGHT", "CRUISE"]).optional(),
  city: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  tag: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  checkIn: z.date().optional(),
  checkOut: z.date().optional(),
  guests: z.number().int().min(1).optional(),
  date: z.date().optional(),
  specialty: z.string().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(12),
  sortBy: z.enum(["relevance", "price_asc", "price_desc", "rating", "newest"]).default("relevance"),
});

export type SearchInput = z.infer<typeof searchSchema>;

// ============================================================
// AVAILABILITY SCHEMA
// ============================================================

export const availabilityRuleSchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMin: z.number().int().min(15).max(480),
  isOpen: z.boolean().default(true),
});

// ============================================================
// PROFILE SCHEMA
// ============================================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
