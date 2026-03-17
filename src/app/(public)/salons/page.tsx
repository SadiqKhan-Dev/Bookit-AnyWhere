import { Suspense } from "react";
import type { Metadata } from "next";
import { Scissors, SlidersHorizontal, Map } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { ListingsFilter } from "@/components/listings/listings-filter";
import { Button } from "@/components/ui/button";
import { searchListings } from "@/actions/listing";

export const metadata: Metadata = {
  title: "Beauty Salons — Book Your Appointment",
  description: "Discover and book top-rated salons near you. Hair, nails, skin & wellness.",
};

interface SalonsPageProps {
  searchParams: {
    q?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    date?: string;
    page?: string;
    sort?: string;
  };
}

async function SalonListings({ searchParams }: SalonsPageProps) {
  const { data: listings, total, hasMore } = await searchListings({
    type: "SALON",
    query: searchParams.q,
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    page: Number(searchParams.page) || 1,
    sortBy: (searchParams.sort as any) || "relevance",
  });

  if (!listings.length) {
    return (
      <div className="text-center py-20">
        <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No salons found</h3>
        <p className="text-gray-500">Try adjusting your filters or search in a different area.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">{total} salons found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing, i) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            slug={listing.slug}
            type={listing.type}
            title={listing.title}
            city={listing.city}
            state={listing.state}
            coverImage={listing.coverImage}
            priceFrom={listing.priceFrom}
            rating={listing.rating}
            reviewCount={listing.reviewCount}
            isFeatured={listing.isFeatured}
            index={i}
          />
        ))}
      </div>
    </>
  );
}

export default function SalonsPage({ searchParams }: SalonsPageProps) {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Beauty Salons</h1>
          </div>
          <p className="text-gray-500 ml-13">
            Hair, nails, skin & wellness — book your appointment instantly
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <aside className="w-full lg:w-64 shrink-0">
            <ListingsFilter type="SALON" searchParams={searchParams} />
          </aside>

          {/* Listings */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Map className="h-4 w-4" /> Map view
                </Button>
              </div>
              <select className="text-sm border rounded-lg px-3 py-1.5 bg-white">
                <option value="relevance">Most relevant</option>
                <option value="rating">Highest rated</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <SalonListings searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
