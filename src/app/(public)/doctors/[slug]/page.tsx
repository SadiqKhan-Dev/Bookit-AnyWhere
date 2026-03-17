import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Star, Video, User as UserIcon } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MedicalBookingWidget } from "@/components/bookings/medical-booking-widget";
import { ReviewList } from "@/components/listings/review-list";
import { getListingBySlug } from "@/actions/listing";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DoctorPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: DoctorPageProps): Promise<Metadata> {
  const listing = await getListingBySlug(params.slug);
  if (!listing) return { title: "Clinic Not Found" };
  return { title: listing.title, description: listing.description.slice(0, 160) };
}

export default async function DoctorPage({ params }: DoctorPageProps) {
  const listing = await getListingBySlug(params.slug);
  if (!listing || listing.type !== "MEDICAL") notFound();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Image Gallery */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] px-4 md:px-8 pt-4">
        <div className="col-span-2 row-span-2 relative rounded-l-2xl overflow-hidden">
          <Image src={listing.coverImage} alt={listing.title} fill className="object-cover" priority />
        </div>
        {[...listing.images, ...Array(Math.max(0, 4 - listing.images.length)).fill(listing.coverImage)]
          .slice(0, 4).map((img, i) => (
            <div key={i} className={`relative overflow-hidden ${i === 1 ? "rounded-tr-2xl" : i === 3 ? "rounded-br-2xl" : ""}`}>
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <Badge variant="medical" className="mb-2">Medical Clinic</Badge>
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

            <div className="py-6">
              <h2 className="text-xl font-semibold mb-3">About this clinic</h2>
              <p className="text-gray-600 leading-relaxed">{listing.description}</p>
            </div>

            <Separator />

            {/* Doctors */}
            {listing.doctors.length > 0 && (
              <div className="py-6">
                <h2 className="text-xl font-semibold mb-6">Our Doctors</h2>
                <div className="space-y-4">
                  {listing.doctors.map((doc) => (
                    <div key={doc.id} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-emerald-200 transition-colors">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0 bg-emerald-50">
                        {doc.imageUrl ? (
                          <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <UserIcon className="h-8 w-8 text-emerald-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{doc.name}</h3>
                            <p className="text-sm text-emerald-600">{doc.specialty}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doc.qualifications.map((q) => (
                                <Badge key={q} className="bg-emerald-100 text-emerald-700 text-xs">{q}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(doc.consultFee)}</p>
                            <p className="text-xs text-gray-400">per consultation</p>
                          </div>
                        </div>
                        {doc.bio && <p className="text-sm text-gray-500 mt-2">{doc.bio}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          {doc.appointmentTypes.includes("TELEMEDICINE") && (
                            <span className="flex items-center gap-1 text-xs text-blue-600">
                              <Video className="h-3.5 w-3.5" /> Telemedicine available
                            </span>
                          )}
                          {doc.languages.length > 0 && (
                            <span className="text-xs text-gray-500">
                              🌐 {doc.languages.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Services */}
            <div className="py-6">
              <h2 className="text-xl font-semibold mb-6">Services & Fees</h2>
              <div className="space-y-3">
                {listing.services.map((svc) => (
                  <div key={svc.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{svc.name}</p>
                      {svc.category && <p className="text-xs text-emerald-600 mt-0.5">{svc.category}</p>}
                      <p className="text-xs text-gray-400 mt-1">Duration: {svc.durationMin} min</p>
                    </div>
                    <p className="font-bold text-gray-900">{formatCurrency(svc.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="py-6">
              <ReviewList listingId={listing.id} reviews={listing.reviews} rating={listing.rating} reviewCount={listing.reviewCount} />
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:w-96 shrink-0">
            <div className="sticky top-24">
              <MedicalBookingWidget
                listing={listing}
                services={listing.services}
                doctors={listing.doctors}
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
