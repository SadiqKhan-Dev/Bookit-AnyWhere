"use client";

import { useCallback, useState, useRef } from "react";
import Map, { Marker, Popup, NavigationControl, GeolocateControl } from "react-map-gl";
import { X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import "mapbox-gl/dist/mapbox-gl.css";
import { formatCurrency, LISTING_TYPE_CONFIG } from "@/lib/utils";
import type { MapMarker } from "@/types";

interface ListingsMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function ListingsMap({ markers, center, zoom = 11 }: ListingsMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [viewState, setViewState] = useState({
    latitude: center?.lat ?? 40.7589,
    longitude: center?.lng ?? -73.9851,
    zoom,
  });

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        onClick={() => setSelectedMarker(null)}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {markers.map((marker) => {
          const typeConfig = LISTING_TYPE_CONFIG[marker.type as keyof typeof LISTING_TYPE_CONFIG];
          const isSelected = selectedMarker?.id === marker.id;

          return (
            <Marker
              key={marker.id}
              latitude={marker.latitude}
              longitude={marker.longitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarker(marker);
              }}
            >
              <button
                className={`
                  flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-md
                  transition-all cursor-pointer border-2
                  ${isSelected
                    ? "bg-gray-900 text-white border-gray-900 scale-110"
                    : `${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor} hover:scale-110`
                  }
                `}
              >
                {formatCurrency(marker.price)}
              </button>
            </Marker>
          );
        })}

        {selectedMarker && (
          <Popup
            latitude={selectedMarker.latitude}
            longitude={selectedMarker.longitude}
            onClose={() => setSelectedMarker(null)}
            closeButton={false}
            offset={20}
          >
            <div className="w-56 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setSelectedMarker(null)}
                className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <Link
                href={`${LISTING_TYPE_CONFIG[selectedMarker.type as keyof typeof LISTING_TYPE_CONFIG].href}/${selectedMarker.id}`}
              >
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm truncate">{selectedMarker.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(selectedMarker.price)}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        LISTING_TYPE_CONFIG[selectedMarker.type as keyof typeof LISTING_TYPE_CONFIG].bgColor
                      } ${
                        LISTING_TYPE_CONFIG[selectedMarker.type as keyof typeof LISTING_TYPE_CONFIG].textColor
                      }`}
                    >
                      {LISTING_TYPE_CONFIG[selectedMarker.type as keyof typeof LISTING_TYPE_CONFIG].label}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
