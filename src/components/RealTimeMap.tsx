'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle real-time location tracking
function LocationTracker({ onLocationUpdate }: { onLocationUpdate?: (lat: number, lng: number) => void }) {
  const map = useMap();
  const [currentPosition, setCurrentPosition] = useState<L.LatLng | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLatLng = new L.LatLng(latitude, longitude);
        
        setCurrentPosition(newLatLng);
        map.setView(newLatLng, map.getZoom());
        
        if (onLocationUpdate) {
          onLocationUpdate(latitude, longitude);
        }
      },
      (error) => {
        console.error('Error tracking location:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map, onLocationUpdate]);

  return currentPosition ? (
    <Marker position={currentPosition}>
      <Popup>
        <div className="text-center">
          <p className="font-semibold">Your Location</p>
          <p className="text-xs text-gray-500">
            Lat: {currentPosition.lat.toFixed(4)}, Lng: {currentPosition.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

interface RealTimeMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  markers?: Array<{
    position: [number, number];
    popup?: string;
  }>;
  enableTracking?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  onLocationUpdate?: (lat: number, lng: number) => void;
}

export default function RealTimeMap({
  center = [40.7128, -74.0060], // Default: New York
  zoom = 13,
  height = '400px',
  markers = [],
  enableTracking = true,
  onLocationSelect,
  onLocationUpdate,
}: RealTimeMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '12px', zIndex: 10 }}
      scrollWheelZoom={true}
      className="rounded-lg shadow-lg"
    >
      {/* OpenStreetMap tiles - completely free */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Real-time location tracking */}
      {enableTracking && <LocationTracker onLocationUpdate={onLocationUpdate} />}

      {/* Map click handler */}
      {onLocationSelect && <MapClickHandler onMapClick={onLocationSelect} />}

      {/* Custom markers */}
      {markers.map((marker, index) => (
        <Marker key={index} position={marker.position}>
          {marker.popup && (
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
