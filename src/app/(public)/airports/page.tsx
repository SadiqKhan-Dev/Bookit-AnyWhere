import { Suspense } from "react";
import type { Metadata } from "next";
import { PlaneLanding } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { ListingsFilter } from "@/components/listings/listings-filter";
import { searchListings } from "@/actions/listing";

export const metadata: Metadata = {
  title: "Airports — Lounges, Transfers & Parking",
  description: "Book airport lounges, transfers, fast-track security and parking at major airports.",
};

interface AirportsPageProps {
  searchParams: {
    q?: string;
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    page?: string;
    sort?: string;
  };
}

async function AirportListings({ searchParams }: AirportsPageProps) {
  const { data: listings, total } = await searchListings({
    type: "AIRPORT",
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
        <PlaneLanding className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No airports found</h3>
        <p className="text-gray-500">Try a different city or search term.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">{total} airports found</p>
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

export default function AirportsPage({ searchParams }: AirportsPageProps) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500">
              <PlaneLanding className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Airports</h1>
          </div>
          <p className="text-gray-500">Book lounges, transfers, fast-track & parking</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <ListingsFilter type="AIRPORT" searchParams={searchParams} />
          </aside>

          <main className="flex-1">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <ListingCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <AirportListings searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
