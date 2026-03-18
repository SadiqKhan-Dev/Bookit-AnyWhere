import { Suspense } from "react";
import type { Metadata } from "next";
import { Ship } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { ListingCard, ListingCardSkeleton } from "@/components/listings/listing-card";
import { ListingsFilter } from "@/components/listings/listings-filter";
import { searchListings } from "@/actions/listing";

export const metadata: Metadata = {
  title: "Cruises — Luxury Ship Vacations",
  description: "Book cabin on world-class cruise ships. Caribbean, Mediterranean, Alaska and more.",
};

interface CruisesPageProps {
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

async function CruiseListings({ searchParams }: CruisesPageProps) {
  const { data: listings, total } = await searchListings({
    type: "CRUISE",
    query: searchParams.q,
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    page: Number(searchParams.page) || 1,
    sortBy: (searchParams.sort as any) || "relevance",
  });

  if (!listings.length) {
    return (
      <div className="text-center py-20">
        <Ship className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No cruises found</h3>
        <p className="text-gray-500">Try adjusting your search filters.</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">{total} cruises found</p>
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

export default function CruisesPage({ searchParams }: CruisesPageProps) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-b">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500">
              <Ship className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Cruise Vacations</h1>
          </div>
          <p className="text-gray-500">Caribbean, Mediterranean, Alaska & beyond — luxury ship adventures</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 shrink-0">
            <ListingsFilter type="CRUISE" searchParams={searchParams} />
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
              <CruiseListings searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
