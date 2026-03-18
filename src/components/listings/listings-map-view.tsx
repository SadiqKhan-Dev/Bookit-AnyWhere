import { MapPin } from "lucide-react";
import { ListingsMap } from "@/components/maps/listings-map";
import { searchListings } from "@/actions/listing";
import type { ListingType } from "@prisma/client";

interface ListingsMapViewProps {
  type: ListingType;
  searchParams: Record<string, string | undefined>;
}

export async function ListingsMapView({ type, searchParams }: ListingsMapViewProps) {
  const { data: listings } = await searchListings({
    type,
    query: searchParams.q,
    city: searchParams.city,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    rating: searchParams.rating ? Number(searchParams.rating) : undefined,
    tag: searchParams.tag,
    pageSize: 100, // load more for map view
  });

  const markers = listings
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      latitude: l.latitude,
      longitude: l.longitude,
      title: l.title,
      price: l.priceFrom,
      type: l.type,
    }));

  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-100 rounded-2xl">
        <MapPin className="h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No listings to show on map</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  // Center map on first result or average of all markers
  const centerLat = markers.reduce((s, m) => s + m.latitude, 0) / markers.length;
  const centerLng = markers.reduce((s, m) => s + m.longitude, 0) / markers.length;

  return (
    <div className="relative">
      <p className="text-sm text-gray-500 mb-3">{markers.length} listing{markers.length !== 1 ? "s" : ""} on map</p>
      <div className="h-[600px] lg:h-[700px]">
        <ListingsMap
          markers={markers}
          center={{ lat: centerLat, lng: centerLng }}
          zoom={markers.length === 1 ? 14 : 10}
        />
      </div>
    </div>
  );
}
