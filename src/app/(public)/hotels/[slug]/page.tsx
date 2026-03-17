import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Star, Users, Bed, Wifi } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HotelBookingWidget } from "@/components/bookings/hotel-booking-widget";
import { ReviewList } from "@/components/listings/review-list";
import { getListingBySlug } from "@/actions/listing";
import { formatCurrency, formatDate, getRatingLabel } from "@/lib/utils";

interface HotelPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: HotelPageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: "Hotel Not Found" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default async function HotelPage({ params }: HotelPageProps) {
  const listing = await getListingBySlug(params.slug);
  if (!listing || listing.type !== "HOTEL") notFound();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Image Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] px-4 md:px-8 pt-4">
        <div className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden">
          <Image src={listing.coverImage} alt={listing.title} fill className="object-cover" priority />
        </div>
        {[...listing.images, ...Array(Math.max(0, 4 - listing.images.length)).fill(listing.coverImage)]
          .slice(0, 4)
          .map((img, i) => (
            <div key={i} className={`relative overflow-hidden ${i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""}`}>
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <Badge variant="hotel" className="mb-2">Hotel</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.address}, {listing.city}, {listing.state}
                </span>
                {listing.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <strong className="text-gray-900">{listing.rating.toFixed(1)}</strong>
                    <span className="text-gray-400">({listing.reviewCount} reviews)</span>
                  </span>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-4 py-6">
              <Avatar className="h-14 w-14">
                <AvatarImage src={listing.provider.imageUrl || ""} />
                <AvatarFallback>{listing.provider.firstName?.[0]}{listing.provider.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">Hosted by {listing.provider.firstName} {listing.provider.lastName}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(listing.provider.createdAt)}</p>
              </div>
            </div>

            <Separator />

            <div className="py-6">
              <h2 className="text-xl font-semibold mb-3">About this hotel</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            <Separator />

            {/* Rooms */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-6">Available Rooms</h2>
              <div className="space-y-4">
                {listing.rooms.map((room) => (
                  <div key={room.id} className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="relative w-full md:w-40 h-32 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={room.images[0] || listing.coverImage}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{room.name}</h3>
                          <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">{room.type}</Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(room.pricePerNight)}</p>
                          <p className="text-xs text-gray-500">per night</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" /> Up to {room.maxGuests} guests
                        </span>
                        {room.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="flex items-center gap-1">✓ {a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-4">Hotel amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.amenities.map(({ amenity }) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-blue-50">
                        <span className="text-base">✓</span>
                      </div>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="py-6">
              <ReviewList
                listingId={listing.id}
                reviews={listing.reviews}
                rating={listing.rating}
                reviewCount={listing.reviewCount}
              />
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-24">
              <HotelBookingWidget listing={listing} rooms={listing.rooms} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
