import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import { getUserWishlist } from "@/actions/wishlist";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const wishlists = await getUserWishlist();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
            <Heart className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500">{wishlists.length} saved listing{wishlists.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {wishlists.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
            <Heart className="h-14 w-14 text-gray-200 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 text-lg mb-2">No saved listings yet</h3>
            <p className="text-gray-500 mb-6">
              Tap the heart icon on any listing to save it here for later.
            </p>
            <Link href="/">
              <Button className="bg-rose-500 hover:bg-rose-600">Explore listings</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {wishlists.map(({ listing }, i) => (
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
                tags={listing.tags}
                index={i}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
