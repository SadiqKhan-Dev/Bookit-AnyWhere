import { PrismaClient, ListingType, DayOfWeek, RoomType, AppointmentType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Amenities
  const amenities = await Promise.all([
    prisma.amenity.upsert({
      where: { name: "WiFi" },
      update: {},
      create: { name: "WiFi", icon: "wifi", category: "connectivity" },
    }),
    prisma.amenity.upsert({
      where: { name: "Parking" },
      update: {},
      create: { name: "Parking", icon: "car", category: "transport" },
    }),
    prisma.amenity.upsert({
      where: { name: "Air Conditioning" },
      update: {},
      create: { name: "Air Conditioning", icon: "wind", category: "comfort" },
    }),
    prisma.amenity.upsert({
      where: { name: "Pool" },
      update: {},
      create: { name: "Pool", icon: "waves", category: "recreation" },
    }),
    prisma.amenity.upsert({
      where: { name: "Gym" },
      update: {},
      create: { name: "Gym", icon: "dumbbell", category: "recreation" },
    }),
    prisma.amenity.upsert({
      where: { name: "Breakfast Included" },
      update: {},
      create: { name: "Breakfast Included", icon: "coffee", category: "dining" },
    }),
  ]);

  // Seed demo provider user
  const provider = await prisma.user.upsert({
    where: { email: "provider@demo.com" },
    update: {},
    create: {
      id: "user_demo_provider",
      email: "provider@demo.com",
      firstName: "Demo",
      lastName: "Provider",
      role: "PROVIDER",
    },
  });

  // Seed Salon Listing
  const salon = await prisma.listing.upsert({
    where: { slug: "luxe-hair-studio-nyc" },
    update: {},
    create: {
      type: ListingType.SALON,
      title: "Luxe Hair Studio NYC",
      description: "Premium hair salon in the heart of Manhattan offering cuts, color, and styling services.",
      slug: "luxe-hair-studio-nyc",
      address: "123 5th Avenue",
      city: "New York",
      state: "NY",
      country: "US",
      zipCode: "10001",
      latitude: 40.7484,
      longitude: -73.9967,
      coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      images: [
        "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
      ],
      priceFrom: 5000,
      providerId: provider.id,
      services: {
        create: [
          { name: "Haircut & Style", durationMin: 60, price: 8500, category: "Hair" },
          { name: "Color & Highlights", durationMin: 120, price: 15000, category: "Color" },
          { name: "Blowout", durationMin: 45, price: 5500, category: "Styling" },
          { name: "Keratin Treatment", durationMin: 180, price: 25000, category: "Treatment" },
          { name: "Balayage", durationMin: 150, price: 20000, category: "Color" },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: DayOfWeek.MONDAY, openTime: "09:00", closeTime: "19:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.TUESDAY, openTime: "09:00", closeTime: "19:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.WEDNESDAY, openTime: "09:00", closeTime: "19:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.THURSDAY, openTime: "09:00", closeTime: "20:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.FRIDAY, openTime: "09:00", closeTime: "20:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.SATURDAY, openTime: "10:00", closeTime: "17:00", slotDurationMin: 30 },
        ],
      },
    },
  });

  // Seed Hotel Listing
  const hotel = await prisma.listing.upsert({
    where: { slug: "grand-palace-hotel-miami" },
    update: {},
    create: {
      type: ListingType.HOTEL,
      title: "Grand Palace Hotel Miami",
      description: "Luxury 5-star hotel with ocean views, world-class dining, and exclusive amenities.",
      slug: "grand-palace-hotel-miami",
      address: "100 Ocean Drive",
      city: "Miami",
      state: "FL",
      country: "US",
      zipCode: "33139",
      latitude: 25.7617,
      longitude: -80.1918,
      coverImage: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
      images: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      ],
      priceFrom: 25000,
      providerId: provider.id,
      rooms: {
        create: [
          {
            roomNumber: "101",
            type: RoomType.SINGLE,
            name: "Cozy Single Room",
            maxGuests: 1,
            pricePerNight: 25000,
            images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"],
            amenities: ["WiFi", "TV", "Mini Bar"],
          },
          {
            roomNumber: "201",
            type: RoomType.DOUBLE,
            name: "Ocean View Double",
            maxGuests: 2,
            pricePerNight: 38000,
            images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"],
            amenities: ["WiFi", "TV", "Ocean View", "Mini Bar", "Balcony"],
          },
          {
            roomNumber: "501",
            type: RoomType.SUITE,
            name: "Presidential Suite",
            maxGuests: 4,
            pricePerNight: 120000,
            images: ["https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800"],
            amenities: ["WiFi", "TV", "Ocean View", "Jacuzzi", "Butler Service", "Private Terrace"],
          },
        ],
      },
    },
  });

  // Seed Medical Listing
  const clinic = await prisma.listing.upsert({
    where: { slug: "wellness-medical-center-chicago" },
    update: {},
    create: {
      type: ListingType.MEDICAL,
      title: "Wellness Medical Center Chicago",
      description: "Comprehensive healthcare facility with expert physicians across multiple specialties.",
      slug: "wellness-medical-center-chicago",
      address: "456 Michigan Ave",
      city: "Chicago",
      state: "IL",
      country: "US",
      zipCode: "60601",
      latitude: 41.8819,
      longitude: -87.6278,
      coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
      images: [
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
      ],
      priceFrom: 10000,
      providerId: provider.id,
      doctors: {
        create: [
          {
            name: "Dr. Sarah Mitchell",
            specialty: "General Practitioner",
            qualifications: ["MD", "Board Certified"],
            bio: "Dr. Mitchell has 15 years of experience in primary care medicine.",
            consultFee: 15000,
            appointmentTypes: [AppointmentType.IN_PERSON, AppointmentType.TELEMEDICINE],
            languages: ["English", "Spanish"],
          },
          {
            name: "Dr. James Chen",
            specialty: "Cardiologist",
            qualifications: ["MD", "PhD", "FACC"],
            bio: "Dr. Chen specializes in advanced cardiac care and prevention.",
            consultFee: 25000,
            appointmentTypes: [AppointmentType.IN_PERSON],
            languages: ["English", "Mandarin"],
          },
        ],
      },
      services: {
        create: [
          { name: "General Consultation", durationMin: 30, price: 15000, category: "Primary Care" },
          { name: "Specialist Consultation", durationMin: 45, price: 25000, category: "Specialist" },
          { name: "Health Checkup Package", durationMin: 90, price: 45000, category: "Wellness" },
          { name: "Telemedicine Consultation", durationMin: 20, price: 8000, category: "Remote Care" },
        ],
      },
      availability: {
        create: [
          { dayOfWeek: DayOfWeek.MONDAY, openTime: "08:00", closeTime: "18:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.TUESDAY, openTime: "08:00", closeTime: "18:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.WEDNESDAY, openTime: "08:00", closeTime: "18:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.THURSDAY, openTime: "08:00", closeTime: "18:00", slotDurationMin: 30 },
          { dayOfWeek: DayOfWeek.FRIDAY, openTime: "08:00", closeTime: "16:00", slotDurationMin: 30 },
        ],
      },
    },
  });

  console.log("✅ Seeding complete!");
  console.log(`  → ${amenities.length} amenities`);
  console.log(`  → Salon: ${salon.title}`);
  console.log(`  → Hotel: ${hotel.title}`);
  console.log(`  → Clinic: ${clinic.title}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
