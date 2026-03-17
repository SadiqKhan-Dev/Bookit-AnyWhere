import { create } from "zustand";
import { persist } from "zustand/middleware";

type ListingType = "SALON" | "HOTEL" | "MEDICAL";

interface SearchState {
  // Active category
  activeType: ListingType | null;
  setActiveType: (type: ListingType | null) => void;

  // Search query
  query: string;
  setQuery: (query: string) => void;

  // Location
  city: string;
  setCity: (city: string) => void;

  // Hotel-specific
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setGuests: (guests: number) => void;

  // Appointment-specific
  date: Date | null;
  setDate: (date: Date | null) => void;

  // Filters
  minPrice: number | null;
  maxPrice: number | null;
  rating: number | null;
  amenities: string[];
  setMinPrice: (price: number | null) => void;
  setMaxPrice: (price: number | null) => void;
  setRating: (rating: number | null) => void;
  toggleAmenity: (amenity: string) => void;

  // Sort
  sortBy: "relevance" | "price_asc" | "price_desc" | "rating" | "newest";
  setSortBy: (sort: "relevance" | "price_asc" | "price_desc" | "rating" | "newest") => void;

  // Map view
  isMapView: boolean;
  toggleMapView: () => void;

  // Reset
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      activeType: null,
      setActiveType: (type) => set({ activeType: type }),

      query: "",
      setQuery: (query) => set({ query }),

      city: "",
      setCity: (city) => set({ city }),

      checkIn: null,
      checkOut: null,
      guests: 2,
      setCheckIn: (checkIn) => set({ checkIn }),
      setCheckOut: (checkOut) => set({ checkOut }),
      setGuests: (guests) => set({ guests }),

      date: null,
      setDate: (date) => set({ date }),

      minPrice: null,
      maxPrice: null,
      rating: null,
      amenities: [],
      setMinPrice: (minPrice) => set({ minPrice }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setRating: (rating) => set({ rating }),
      toggleAmenity: (amenity) =>
        set((state) => ({
          amenities: state.amenities.includes(amenity)
            ? state.amenities.filter((a) => a !== amenity)
            : [...state.amenities, amenity],
        })),

      sortBy: "relevance",
      setSortBy: (sortBy) => set({ sortBy }),

      isMapView: false,
      toggleMapView: () => set((state) => ({ isMapView: !state.isMapView })),

      resetFilters: () =>
        set({
          minPrice: null,
          maxPrice: null,
          rating: null,
          amenities: [],
          sortBy: "relevance",
        }),
    }),
    {
      name: "search-store",
      partialize: (state) => ({
        activeType: state.activeType,
        query: state.query,
        city: state.city,
      }),
    }
  )
);
