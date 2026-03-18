import { Suspense } from "react";
import type { Metadata } from "next";
import { Building2, SlidersHorizontal } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { ListingsFilter } from "@/components/listings/listings-filter";
import { ListingsMapView } from "@/components/listings/listings-map-view";
import { MapViewToggle } from "@/components/listings/map-view-toggle";
import { Button } from "@/components/ui/button";
import { searchListings } from "@/actions/listing";

export const metadata: Metadata = {
  title: "Hotels & Stays — Book Your Room",
  description: "Discover and book luxury hotels, boutique stays, and unique accommodations.",
};

interface HotelsPageProps {
  searchParams: {
    q?: string; city?: string; minPrice?: string; maxPrice?: string;
    rating?: string; tag?: string; checkIn?: string; checkOut?: string;
    guests?: string; page?: string; sort?: string; view?: string;
  };
}

async function HotelListings({ searchParams }: HotelsPageProps) {
  const { data: listings, total } = await searchListings({
    type: "HOTEL",
    query: searchParams.q,
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    tag: searchParams.tag,
    page: Number(searchParams.page) || 1,
    sortBy: (searchParams.sort as any) || "relevance",
  });

  if (!listings.length) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hotels found</h3>
        <p className="text-gray-500">Try adjusting your dates or search in another city.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">{total} hotels found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} id={listing.id} slug={listing.slug} type={listing.type}
            title={listing.title} city={listing.city} state={listing.state}
            coverImage={listing.coverImage} priceFrom={listing.priceFrom}
            rating={listing.rating} reviewCount={listing.reviewCount}
            isFeatured={listing.isFeatured} tags={listing.tags} index={i} />
        ))}
      </div>
    </>
  );
}

export default function HotelsPage({ searchParams }: HotelsPageProps) {
  const isMap = searchParams.view === "map";
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Hotels & Stays</h1>
          </div>
          <p className="text-gray-500">Luxury rooms, suites & unique accommodations</p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <ListingsFilter type="HOTEL" searchParams={searchParams} />
          </aside>
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </Button>
                <MapViewToggle />
              </div>
            </div>
            {isMap ? (
              <ListingsMapView type="HOTEL" searchParams={searchParams} />
            ) : (
              <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 9 }).map((_, i) => <ListingCardSkeleton key={i} />)}</div>}>
                <HotelListings searchParams={searchParams} />
              </Suspense>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
