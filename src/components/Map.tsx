import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { Icon } from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet - using CDN to avoid build errors
const blueIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const orangeIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  origin: { lat: number; lng: number; city: string };
  current: { lat: number; lng: number; city: string };
  destination: { lat: number; lng: number; city: string };
}

function ChangeView({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(leafletBounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function Map({ origin, current, destination }: MapProps) {
  const center: [number, number] = [current.lat || 0, current.lng || 0];
  
  // Calculate points
  const points: [number, number][] = [
    [origin.lat || 0, origin.lng || 0] as [number, number],
    [current.lat || 0, current.lng || 0] as [number, number],
    [destination.lat || 0, destination.lng || 0] as [number, number]
  ].filter(p => p[0] !== 0 || p[1] !== 0);

  if (points.length === 0) return <div className="h-full bg-slate-100 flex items-center justify-center text-slate-400">Invalid Coords</div>;

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-inner bg-slate-50 relative z-0">
      <MapContainer 
        center={center} 
        zoom={5} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[origin.lat || 0, origin.lng || 0]} icon={blueIcon}>
          <Popup>Origin: {origin.city}</Popup>
        </Marker>

        <Marker position={[current.lat || 0, current.lng || 0]} icon={orangeIcon}>
          <Popup>Current: {current.city}</Popup>
        </Marker>

        <Marker position={[destination.lat || 0, destination.lng || 0]} icon={greenIcon}>
          <Popup>Destination: {destination.city}</Popup>
        </Marker>

        <Polyline 
          positions={[[origin.lat || 0, origin.lng || 0], [current.lat || 0, current.lng || 0]]} 
          color="#94a3b8" 
          dashArray="5, 10"
        />
        <Polyline 
          positions={[[current.lat || 0, current.lng || 0], [destination.lat || 0, destination.lng || 0]]} 
          color="#FF6321" 
          weight={4}
        />

        <ChangeView bounds={points} />
      </MapContainer>
    </div>
  );
}
