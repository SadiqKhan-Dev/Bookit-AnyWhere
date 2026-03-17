import { create } from "zustand";

interface BookingState {
  // Selected listing
  selectedListingId: string | null;
  selectedListingType: "SALON" | "HOTEL" | "MEDICAL" | null;

  // Selected room/service/doctor
  selectedRoomId: string | null;
  selectedServiceId: string | null;
  selectedDoctorId: string | null;

  // Date/time
  checkIn: Date | null;
  checkOut: Date | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  guests: number;

  // Appointment type
  appointmentType: "IN_PERSON" | "TELEMEDICINE";

  // Actions
  setSelectedListing: (id: string, type: "SALON" | "HOTEL" | "MEDICAL") => void;
  setSelectedRoom: (id: string | null) => void;
  setSelectedService: (id: string | null) => void;
  setSelectedDoctor: (id: string | null) => void;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setGuests: (guests: number) => void;
  setAppointmentType: (type: "IN_PERSON" | "TELEMEDICINE") => void;
  reset: () => void;
}

const initialState = {
  selectedListingId: null,
  selectedListingType: null,
  selectedRoomId: null,
  selectedServiceId: null,
  selectedDoctorId: null,
  checkIn: null,
  checkOut: null,
  selectedDate: null,
  selectedTime: null,
  guests: 1,
  appointmentType: "IN_PERSON" as const,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setSelectedListing: (id, type) =>
    set({ selectedListingId: id, selectedListingType: type }),

  setSelectedRoom: (id) => set({ selectedRoomId: id }),
  setSelectedService: (id) => set({ selectedServiceId: id }),
  setSelectedDoctor: (id) => set({ selectedDoctorId: id }),

  setCheckIn: (checkIn) => set({ checkIn }),
  setCheckOut: (checkOut) => set({ checkOut }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setGuests: (guests) => set({ guests }),
  setAppointmentType: (appointmentType) => set({ appointmentType }),

  reset: () => set(initialState),
}));
