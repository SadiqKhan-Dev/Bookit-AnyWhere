"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ListingsFilterProps {
  type: "SALON" | "HOTEL" | "MEDICAL";
  searchParams: Record<string, string | undefined>;
}

const priceRanges = [
  { label: "Under $50", min: 0, max: 50 },
  { label: "$50–$100", min: 50, max: 100 },
  { label: "$100–$200", min: 100, max: 200 },
  { label: "$200+", min: 200, max: undefined },
];

export function ListingsFilter({ type, searchParams }: ListingsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams as Record<string, string>);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasFilters = Object.keys(searchParams).some(
    (k) => k !== "page" && searchParams[k]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-rose-500 hover:text-rose-600 gap-1 h-auto py-1"
          >
            <X className="h-3 w-3" /> Clear all
          </Button>
        )}
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Minimum rating</h3>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                updateFilter(
                  "rating",
                  searchParams.rating === String(rating) ? undefined : String(rating)
                )
              }
              className={cn(
                "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors",
                searchParams.rating === String(rating)
                  ? "bg-rose-50 text-rose-600 font-medium"
                  : "hover:bg-gray-50 text-gray-600"
              )}
            >
              <Star
                className={cn(
                  "h-4 w-4",
                  searchParams.rating === String(rating)
                    ? "fill-rose-400 text-rose-400"
                    : "fill-amber-400 text-amber-400"
                )}
              />
              {rating}+ stars
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Price range</h3>
        <div className="space-y-2">
          {priceRanges.map((range) => {
            const isActive =
              searchParams.minPrice === String(range.min) &&
              searchParams.maxPrice === (range.max ? String(range.max) : undefined);
            return (
              <button
                key={range.label}
                onClick={() => {
                  if (isActive) {
                    updateFilter("minPrice", undefined);
                    updateFilter("maxPrice", undefined);
                  } else {
                    updateFilter("minPrice", String(range.min));
                    if (range.max) updateFilter("maxPrice", String(range.max));
                  }
                }}
                className={cn(
                  "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-rose-50 text-rose-600 font-medium"
                    : "hover:bg-gray-50 text-gray-600"
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Type-specific filters */}
      {type === "HOTEL" && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Room type</h3>
            <div className="space-y-2">
              {["Single", "Double", "Suite", "Deluxe"].map((roomType) => (
                <button
                  key={roomType}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {roomType}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {type === "MEDICAL" && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Specialty</h3>
            <div className="space-y-2">
              {[
                "General Practitioner",
                "Cardiologist",
                "Dermatologist",
                "Pediatrician",
                "Orthopedic",
              ].map((spec) => (
                <button
                  key={spec}
                  className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left"
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
