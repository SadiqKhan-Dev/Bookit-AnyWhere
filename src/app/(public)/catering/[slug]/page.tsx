import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Star, Clock, ChefHat, Users, Leaf, BadgeCheck } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReviewList } from "@/components/listings/review-list";
import { getListingBySlug } from "@/actions/listing";
import { formatCurrency, formatDate, getRatingLabel } from "@/lib/utils";

interface CateringPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CateringPageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: "Catering Not Found" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function CateringDetailPage({ params }: CateringPageProps) {
  const listing = await getListingBySlug(params.slug);
  if (!listing || listing.type !== "CATERING") notFound();

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
                <Badge variant="catering">Catering</Badge>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About this caterer</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            <Separator />

            {/* Catering Packages */}
            {listing.cateringPackages.length > 0 && (
              <div className="py-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Catering Packages</h2>
                <div className="space-y-6">
                  {listing.cateringPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-6 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <ChefHat className="h-5 w-5 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                          </div>
                          <p className="text-sm font-medium text-red-600">{pkg.cuisine}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">{formatCurrency(pkg.pricePerPerson / 100)}</p>
                          <p className="text-sm text-gray-500">per person</p>
                        </div>
                      </div>

                      {pkg.description && (
                        <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          {pkg.minGuests}{pkg.maxGuests ? ` - ${pkg.maxGuests}` : ""} guests
                        </span>
                        {pkg.isVegetarian && (
                          <span className="flex items-center gap-1">
                            <Leaf className="h-4 w-4 text-green-500" />
                            Vegetarian
                          </span>
                        )}
                        {pkg.isHalal && (
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="h-4 w-4 text-green-500" />
                            Halal
                          </span>
                        )}
                      </div>

                      {pkg.menuItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Menu Items</h4>
                          <div className="flex flex-wrap gap-2">
                            {pkg.menuItems.map((item, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-100"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

          {/* Contact / Info Sidebar */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact this caterer</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-gray-600">{listing.city}, {listing.state}</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Member since {formatDate(listing.provider.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
