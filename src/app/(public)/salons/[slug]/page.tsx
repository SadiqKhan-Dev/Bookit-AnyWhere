import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Star, Clock, Shield, Wifi, Car, Wind, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SalonBookingWidget } from "@/components/bookings/salon-booking-widget";
import { ReviewList } from "@/components/listings/review-list";
import { getListingBySlug } from "@/actions/listing";
import { formatCurrency, formatDate, getRatingLabel } from "@/lib/utils";

interface SalonPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: SalonPageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: "Salon Not Found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function SalonPage({ params }: SalonPageProps) {
  const listing = await getListingBySlug(params.slug);
  if (!listing || listing.type !== "SALON") notFound();

  const servicesByCategory = listing.services.reduce(
    (acc, svc) => {
      const cat = svc.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(svc);
      return acc;
    },
    {} as Record<string, typeof listing.services>
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Image Gallery */}
      <div className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] px-4 md:px-8 pt-4">
          <div className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden">
            <Image
              src={listing.coverImage}
              alt={listing.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {listing.images.slice(0, 4).map((img, i) => (
            <div key={i} className={`relative overflow-hidden ${i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""}`}>
              <Image src={img} alt={`${listing.title} ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
          {listing.images.length < 4 &&
            Array.from({ length: 4 - listing.images.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-gray-100 rounded" />
            ))}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="salon">Salon</Badge>
                {listing.isFeatured && <Badge className="bg-rose-500 text-white">Featured</Badge>}
              </div>
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
                    <span className="text-gray-400">·</span>
                    <span className="font-medium text-gray-700">{getRatingLabel(listing.rating)}</span>
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Provider */}
            <div className="flex items-center gap-4 py-6">
              <Avatar className="h-14 w-14">
                <AvatarImage src={listing.provider.imageUrl || ""} />
                <AvatarFallback>
                  {listing.provider.firstName?.[0]}{listing.provider.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">
                  Hosted by {listing.provider.firstName} {listing.provider.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  Member since {formatDate(listing.provider.createdAt)}
                </p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About this salon</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            <Separator />

            {/* Services */}
            <div className="py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Services & Pricing</h2>
              <div className="space-y-8">
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-pink-600 uppercase tracking-wide mb-3">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {services.map((svc) => (
                        <div
                          key={svc.id}
                          className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50/30 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{svc.name}</p>
                            {svc.description && (
                              <p className="text-sm text-gray-500 mt-0.5">{svc.description}</p>
                            )}
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500">{svc.durationMin} min</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(svc.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div className="py-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {listing.amenities.map(({ amenity }) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-50">
                        <span className="text-base">✓</span>
                      </div>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Availability Schedule */}
            <div className="py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Opening hours</h2>
              <div className="space-y-2">
                {listing.availability.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 capitalize w-28">
                      {rule.dayOfWeek.toLowerCase()}
                    </span>
                    {rule.isOpen ? (
                      <span className="text-gray-600">
                        {rule.openTime} – {rule.closeTime}
                      </span>
                    ) : (
                      <span className="text-red-400">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
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
              <SalonBookingWidget
                listing={listing}
                services={listing.services}
                availability={listing.availability}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
