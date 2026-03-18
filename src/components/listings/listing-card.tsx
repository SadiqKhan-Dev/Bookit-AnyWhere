"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, Users, Mountain, Waves, Building2, Sun, TreePine, Droplets, Anchor, MountainSnow, Leaf, Compass, CloudSnow, Wheat, Landmark, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/listings/wishlist-button";
import { formatCurrency, LISTING_TYPE_CONFIG } from "@/lib/utils";
import type { ListingType } from "@prisma/client";

interface ListingCardProps {
  id: string;
  slug: string;
  type: ListingType;
  title: string;
  city: string;
  state: string;
  coverImage: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  amenities?: string[];
  tags?: string[];
  index?: number;
  isSaved?: boolean;
}

const TERRAIN_CONFIG: Record<string, { color: string; Icon: LucideIcon }> = {
  Mountain:    { color: "bg-slate-100 text-slate-700",   Icon: Mountain },
  Beach:       { color: "bg-sky-100 text-sky-700",       Icon: Waves },
  City:        { color: "bg-zinc-100 text-zinc-700",     Icon: Building2 },
  Desert:      { color: "bg-amber-100 text-amber-700",   Icon: Sun },
  Forest:      { color: "bg-green-100 text-green-700",   Icon: TreePine },
  Lake:        { color: "bg-cyan-100 text-cyan-700",     Icon: Droplets },
  Coastal:     { color: "bg-blue-100 text-blue-700",     Icon: Anchor },
  "Ski Resort":{ color: "bg-indigo-100 text-indigo-700", Icon: MountainSnow },
  Tropical:    { color: "bg-lime-100 text-lime-700",     Icon: Leaf },
  Island:      { color: "bg-teal-100 text-teal-700",     Icon: Compass },
  Ocean:       { color: "bg-blue-100 text-blue-700",     Icon: Waves },
  Countryside: { color: "bg-yellow-100 text-yellow-700", Icon: Wheat },
  Arctic:      { color: "bg-purple-100 text-purple-700", Icon: CloudSnow },
  Urban:       { color: "bg-gray-100 text-gray-700",     Icon: Building2 },
  Historic:    { color: "bg-orange-100 text-orange-700", Icon: Landmark },
};

export function ListingCard({
  id,
  slug,
  type,
  title,
  city,
  state,
  coverImage,
  priceFrom,
  rating,
  reviewCount,
  isFeatured = false,
  tags = [],
  index = 0,
  isSaved = false,
}: ListingCardProps) {
  const config = LISTING_TYPE_CONFIG[type];
  const listingUrl = `${config.href}/${slug}`;
  const priceLabel =
    type === "HOTEL" || type === "CRUISE"
      ? "/night"
      : type === "FLIGHT"
      ? "/seat"
      : type === "AIRPORT"
      ? "/service"
      : type === "SALON"
      ? "/service"
      : "/consultation";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={listingUrl}>
        <div className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Top badges */}
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge
                className={`${config.bgColor} ${config.textColor} border-0 font-medium`}
              >
                {config.label}
              </Badge>
              {isFeatured && (
                <Badge className="bg-rose-500 text-white border-0">Featured</Badge>
              )}
            </div>

            {/* Wishlist button */}
            <WishlistButton
              listingId={id}
              initialSaved={isSaved}
              className="absolute right-3 top-3"
            />
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <MapPin className="h-3 w-3" />
              <span>{city}, {state}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 truncate mb-1.5 group-hover:text-rose-600 transition-colors">
              {title}
            </h3>

            {/* Terrain tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 2).map((tag) => {
                  const cfg = TERRAIN_CONFIG[tag];
                  const TagIcon = cfg?.Icon;
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg?.color ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {TagIcon && <TagIcon className="h-3 w-3" />}
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-gray-700">
                {rating > 0 ? rating.toFixed(1) : "New"}
              </span>
              {reviewCount > 0 && (
                <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(priceFrom)}
                </span>
                <span className="text-sm text-gray-500">{priceLabel}</span>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                {type === "HOTEL" ? (
                  <>
                    <Users className="h-3 w-3" /> Up to 4 guests
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" /> Instant book
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
