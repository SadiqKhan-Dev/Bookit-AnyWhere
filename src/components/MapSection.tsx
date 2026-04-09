'use client';

import RealTimeMap from '@/components/RealTimeMap';

interface MapSectionProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapSection({ center = [40.7128, -74.0060], zoom = 12 }: MapSectionProps) {
  return (
    <RealTimeMap
      center={center}
      zoom={zoom}
      height="500px"
      enableTracking={true}
      onLocationSelect={(lat, lng) => {
        console.log("Selected location:", lat, lng);
        // Future: Navigate to search results with location
        // router.push(`/search?lat=${lat}&lng=${lng}`);
      }}
    />
  );
}
