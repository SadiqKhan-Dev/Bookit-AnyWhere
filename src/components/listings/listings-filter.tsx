"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Star, X, Mountain, Waves, Building2, Sun, TreePine, Droplets,
  Anchor, MountainSnow, Leaf, Compass, CloudSnow, Wheat,
  MapPin, SlidersHorizontal, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const terrainTags: { label: string; Icon: LucideIcon; color: string; bg: string; activeBg: string; activeTxt: string }[] = [
  { label: "Mountain",    Icon: Mountain,    color: "text-slate-600",  bg: "bg-slate-50",  activeBg: "bg-slate-100",  activeTxt: "text-slate-700" },
  { label: "Beach",       Icon: Waves,       color: "text-sky-600",    bg: "bg-sky-50",    activeBg: "bg-sky-100",    activeTxt: "text-sky-700" },
  { label: "City",        Icon: Building2,   color: "text-zinc-600",   bg: "bg-zinc-50",   activeBg: "bg-zinc-100",   activeTxt: "text-zinc-700" },
  { label: "Desert",      Icon: Sun,         color: "text-amber-600",  bg: "bg-amber-50",  activeBg: "bg-amber-100",  activeTxt: "text-amber-700" },
  { label: "Forest",      Icon: TreePine,    color: "text-green-600",  bg: "bg-green-50",  activeBg: "bg-green-100",  activeTxt: "text-green-700" },
  { label: "Lake",        Icon: Droplets,    color: "text-cyan-600",   bg: "bg-cyan-50",   activeBg: "bg-cyan-100",   activeTxt: "text-cyan-700" },
  { label: "Coastal",     Icon: Anchor,      color: "text-blue-600",   bg: "bg-blue-50",   activeBg: "bg-blue-100",   activeTxt: "text-blue-700" },
  { label: "Ski Resort",  Icon: MountainSnow,color: "text-indigo-600", bg: "bg-indigo-50", activeBg: "bg-indigo-100", activeTxt: "text-indigo-700" },
  { label: "Tropical",    Icon: Leaf,        color: "text-lime-600",   bg: "bg-lime-50",   activeBg: "bg-lime-100",   activeTxt: "text-lime-700" },
  { label: "Island",      Icon: Compass,     color: "text-teal-600",   bg: "bg-teal-50",   activeBg: "bg-teal-100",   activeTxt: "text-teal-700" },
  { label: "Arctic",      Icon: CloudSnow,   color: "text-purple-600", bg: "bg-purple-50", activeBg: "bg-purple-100", activeTxt: "text-purple-700" },
  { label: "Countryside", Icon: Wheat,       color: "text-yellow-600", bg: "bg-yellow-50", activeBg: "bg-yellow-100", activeTxt: "text-yellow-700" },
];

const HOTEL_ROOM_TYPES = ["SINGLE", "DOUBLE", "TWIN", "SUITE", "DELUXE", "PENTHOUSE"];
const MEDICAL_SPECIALTIES = [
  "General Practitioner",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Neurologist",
  "Psychiatrist",
  "Oncologist",
];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
];

interface ListingsFilterProps {
  type: "SALON" | "HOTEL" | "MEDICAL" | "AIRPORT" | "FLIGHT" | "CRUISE";
  searchParams: Record<string, string | undefined>;
}

export function ListingsFilter({ type, searchParams }: ListingsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(searchParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice ?? "");
  const [cityInput, setCityInput] = useState(searchParams.city ?? "");
  const [showTags, setShowTags] = useState(false);

  const updateFilter = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(searchParams).filter(([, v]) => v !== undefined)
        ) as Record<string, string>
      );
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setCityInput("");
    router.push(pathname);
  };

  const hasFilters = Object.keys(searchParams).some(
    (k) => !["page", "view"].includes(k) && searchParams[k]
  );

  const applyPriceRange = () => {
    updateFilter({ minPrice: minPrice || undefined, maxPrice: maxPrice || undefined });
  };

  const applyCity = () => {
    updateFilter({ city: cityInput.trim() || undefined });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-rose-500 hover:text-rose-600 gap-1 h-auto py-1 text-xs"
          >
            <X className="h-3 w-3" /> Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort by</h3>
        <select
          value={searchParams.sort ?? "relevance"}
          onChange={(e) => updateFilter({ sort: e.target.value === "relevance" ? undefined : e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <Separator />

      {/* City Search */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">City</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. New York"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyCity()}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <button
            onClick={applyCity}
            className="px-3 py-2 bg-rose-500 text-white text-xs font-medium rounded-xl hover:bg-rose-600 transition shrink-0"
          >
            Go
          </button>
        </div>
        {searchParams.city && (
          <button
            onClick={() => { setCityInput(""); updateFilter({ city: undefined }); }}
            className="mt-1.5 text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Remove city filter
          </button>
        )}
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Minimum rating</h3>
        <div className="space-y-1.5">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() =>
                updateFilter({ rating: searchParams.rating === String(rating) ? undefined : String(rating) })
              }
              className={cn(
                "flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm transition-colors",
                searchParams.rating === String(rating)
                  ? "bg-rose-50 text-rose-600 font-medium"
                  : "hover:bg-gray-50 text-gray-600"
              )}
            >
              <Star className={cn("h-4 w-4", searchParams.rating === String(rating) ? "fill-rose-400 text-rose-400" : "fill-amber-400 text-amber-400")} />
              {rating}+ stars
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Price range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
              className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <span className="text-gray-400 text-sm shrink-0">–</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
              className="w-full pl-6 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </div>
        <button
          onClick={applyPriceRange}
          className="mt-2 w-full py-2 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition"
        >
          Apply price range
        </button>
        {(searchParams.minPrice || searchParams.maxPrice) && (
          <button
            onClick={() => { setMinPrice(""); setMaxPrice(""); updateFilter({ minPrice: undefined, maxPrice: undefined }); }}
            className="mt-1.5 text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear price
          </button>
        )}
      </div>

      <Separator />

      {/* Destination type (collapsible) */}
      <div>
        <button
          onClick={() => setShowTags((v) => !v)}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
        >
          Destination type
          {showTags ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>
        {showTags && (
          <div className="flex flex-wrap gap-1.5">
            {terrainTags.map((terrain) => {
              const isActive = searchParams.tag === terrain.label;
              const { Icon } = terrain;
              return (
                <button
                  key={terrain.label}
                  onClick={() => updateFilter({ tag: isActive ? undefined : terrain.label })}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all",
                    isActive
                      ? `${terrain.activeBg} ${terrain.activeTxt} border-current`
                      : `${terrain.bg} ${terrain.color} border-transparent hover:border-current`
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {terrain.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* HOTEL: Room type */}
      {type === "HOTEL" && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Room type</h3>
            <div className="space-y-1.5">
              {HOTEL_ROOM_TYPES.map((roomType) => (
                <button
                  key={roomType}
                  onClick={() =>
                    updateFilter({ roomType: searchParams.roomType === roomType ? undefined : roomType })
                  }
                  className={cn(
                    "flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm transition-colors capitalize",
                    searchParams.roomType === roomType
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  {roomType.charAt(0) + roomType.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* MEDICAL: Specialty */}
      {type === "MEDICAL" && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Specialty</h3>
            <div className="space-y-1.5">
              {MEDICAL_SPECIALTIES.map((spec) => (
                <button
                  key={spec}
                  onClick={() =>
                    updateFilter({ specialty: searchParams.specialty === spec ? undefined : spec })
                  }
                  className={cn(
                    "flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm transition-colors text-left",
                    searchParams.specialty === spec
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* CRUISE: Cabin type */}
      {type === "CRUISE" && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Cabin type</h3>
            <div className="space-y-1.5">
              {["INTERIOR", "OCEAN VIEW", "BALCONY", "SUITE", "VILLA"].map((cabin) => (
                <button
                  key={cabin}
                  onClick={() =>
                    updateFilter({ cabinType: searchParams.cabinType === cabin ? undefined : cabin })
                  }
                  className={cn(
                    "flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm transition-colors capitalize",
                    searchParams.cabinType === cabin
                      ? "bg-teal-50 text-teal-700 font-medium"
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  {cabin.charAt(0) + cabin.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* FLIGHT: Seat class */}
      {type === "FLIGHT" && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Seat class</h3>
            <div className="space-y-1.5">
              {["ECONOMY", "BUSINESS", "FIRST"].map((cls) => (
                <button
                  key={cls}
                  onClick={() =>
                    updateFilter({ seatClass: searchParams.seatClass === cls ? undefined : cls })
                  }
                  className={cn(
                    "flex items-center gap-2 w-full rounded-xl px-3 py-2 text-sm transition-colors capitalize",
                    searchParams.seatClass === cls
                      ? "bg-violet-50 text-violet-700 font-medium"
                      : "hover:bg-gray-50 text-gray-600"
                  )}
                >
                  {cls.charAt(0) + cls.slice(1).toLowerCase()} Class
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
