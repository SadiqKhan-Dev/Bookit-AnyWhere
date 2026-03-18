import type {
  Listing,
  User,
  Service,
  Room,
  Doctor,
  Booking,
  Review,
  Amenity,
  ListingAmenity,
  AvailabilityRule,
  Payment,
  Notification,
  FlightRoute,
  FlightSeat,
  CruiseCabin,
} from "@prisma/client";

export type { ListingType, BookingStatus, PaymentStatus, UserRole, DayOfWeek, RoomType, AppointmentType } from "@prisma/client";
export type { FlightRoute, FlightSeat, CruiseCabin } from "@prisma/client";

// ============================================================
// ENRICHED TYPES (with relations)
// ============================================================

export type ListingWithRelations = Listing & {
  provider: User;
  services: Service[];
  rooms: Room[];
  doctors: Doctor[];
  amenities: (ListingAmenity & { amenity: Amenity })[];
  availability: AvailabilityRule[];
  reviews: (Review & { author: User })[];
  flightRoutes: (FlightRoute & { seats: FlightSeat[] })[];
  cruiseCabins: CruiseCabin[];
  _count?: {
    bookings: number;
    reviews: number;
  };
};

export type BookingWithRelations = Booking & {
  listing: Listing;
  customer: User;
  service?: Service | null;
  room?: Room | null;
  doctor?: Doctor | null;
  flightSeat?: (FlightSeat & { flightRoute: FlightRoute }) | null;
  cruiseCabin?: CruiseCabin | null;
  payment?: Payment | null;
  review?: Review | null;
};

export type ReviewWithAuthor = Review & {
  author: User;
};

// ============================================================
// SEARCH / FILTER TYPES
// ============================================================

export type SearchFilters = {
  type?: "SALON" | "HOTEL" | "MEDICAL" | "AIRPORT" | "FLIGHT" | "CRUISE";
  query?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
  // Hotel/Cruise-specific
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  roomType?: string;
  // Salon/Medical/Airport-specific
  date?: Date;
  serviceCategory?: string;
  specialty?: string;
  appointmentType?: string;
  // Flight-specific
  origin?: string;
  destination?: string;
  departureDate?: Date;
  passengers?: number;
  cabinClass?: string;
};

export type SortOption = "relevance" | "price_asc" | "price_desc" | "rating" | "newest";

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

// ============================================================
// BOOKING FORM TYPES
// ============================================================

export type HotelBookingForm = {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
};

export type SalonBookingForm = {
  serviceId: string;
  date: Date;
  time: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
};

export type MedicalBookingForm = {
  serviceId: string;
  doctorId?: string;
  date: Date;
  time: string;
  appointmentType: "IN_PERSON" | "TELEMEDICINE";
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
};

export type AirportBookingForm = {
  serviceId: string;
  date: Date;
  time: string;
  passengers: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  flightNumber?: string;
  notes?: string;
};

export type FlightBookingForm = {
  flightSeatId: string;
  departureDate: Date;
  passengers: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
};

export type CruiseBookingForm = {
  cruiseCabinId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
};

// ============================================================
// DASHBOARD / ANALYTICS
// ============================================================

export type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageRating: number;
  totalReviews: number;
};

export type RevenueDataPoint = {
  date: string;
  revenue: number;
  bookings: number;
};

// ============================================================
// MAP TYPES
// ============================================================

export type MapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  price: number;
  type: string;
};

// ============================================================
// AVAILABILITY
// ============================================================

export type TimeSlot = {
  time: string;
  isAvailable: boolean;
  isTaken: boolean;
};
