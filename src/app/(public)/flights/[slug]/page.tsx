import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Star, Clock, Plane, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FlightBookingWidget } from "@/components/bookings/flight-booking-widget";
import { ReviewList } from "@/components/listings/review-list";
import { getListingBySlug } from "@/actions/listing";
import { formatCurrency } from "@/lib/utils";

interface FlightPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: FlightPageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: "Flight Not Found" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default async function FlightPage({ params }: FlightPageProps) {
  const listing = await getListingBySlug(params.slug);
  if (!listing || listing.type !== "FLIGHT") notFound();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero image */}
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
              <Badge className="bg-violet-100 text-violet-700 border-0 mb-2">Flight</Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.city}, {listing.state}
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

            <div className="py-6">
              <h2 className="text-xl font-semibold mb-3">About this flight</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            <Separator />

            {/* Flight Routes */}
            {listing.flightRoutes.length > 0 && (
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-6">Route & Seat Classes</h2>
                <div className="space-y-6">
                  {listing.flightRoutes.map((route) => (
                    <div key={route.id} className="p-5 rounded-2xl border border-gray-100">
                      {/* Route Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{route.origin}</p>
                            <p className="text-sm text-gray-500">{route.originCity}</p>
                            <p className="text-sm font-medium text-gray-700">{route.departureTime}</p>
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-gray-400">
                              <div className="h-px w-8 bg-gray-300" />
                              <Plane className="h-4 w-4" />
                              <div className="h-px w-8 bg-gray-300" />
                            </div>
                            <p className="text-xs text-gray-500">{Math.floor(route.durationMin / 60)}h {route.durationMin % 60}m</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{route.destination}</p>
                            <p className="text-sm text-gray-500">{route.destCity}</p>
                            <p className="text-sm font-medium text-gray-700">{route.arrivalTime}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{route.airline}</p>
                          <Badge className="bg-violet-100 text-violet-700 text-xs border-0 mt-1">{route.flightNumber}</Badge>
                          {route.aircraft && <p className="text-xs text-gray-400 mt-1">{route.aircraft}</p>}
                        </div>
                      </div>

                      {/* Seat Classes */}
                      <div className="space-y-2 mt-4">
                        {route.seats.map((seat) => (
                          <div key={seat.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{seat.name}</p>
                              <p className="text-xs text-gray-500">{seat.availableSeats} seats available</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {seat.amenities.slice(0, 3).map((a) => (
                                  <span key={a} className="text-xs text-gray-500">✓ {a}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">{formatCurrency(seat.pricePerSeat)}</p>
                              <p className="text-xs text-gray-400">per seat</p>
                            </div>
                          </div>
                        ))}
                      </div>
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
              <FlightBookingWidget listing={listing} flightRoutes={listing.flightRoutes} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
