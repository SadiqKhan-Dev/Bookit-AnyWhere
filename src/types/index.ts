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
} from "@prisma/client";

export type { ListingType, BookingStatus, PaymentStatus, UserRole, DayOfWeek, RoomType, AppointmentType } from "@prisma/client";

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
  type?: "SALON" | "HOTEL" | "MEDICAL";
  query?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  amenities?: string[];
  // Hotel-specific
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  roomType?: string;
  // Salon/Medical-specific
  date?: Date;
  serviceCategory?: string;
  specialty?: string;
  appointmentType?: string;
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
