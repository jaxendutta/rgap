'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin } from 'lucide-react';
import L from 'leaflet';

// --- Fix Leaflet Default Icon Issue in Next.js ---
// Leaflet's default icon assets often break in bundlers.
// We'll create a custom DivIcon instead for a cleaner look.
const createCustomIcon = () => {
    return L.divIcon({
        className: 'custom-pin',
        html: `<div style="
      background-color: #2563eb;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

// --- Helper Component to Recenter Map ---
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 2 });
    }, [center, zoom, map]);
    return null;
}

// --- Types ---
interface LocationMapProps {
    title: string;
    location?: string;
    height?: number | string;
    className?: string;
}

interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
    importance: number;
}

const GEOCODING_API = "https://nominatim.openstreetmap.org/search";

export default function LocationMap({
    title,
    location,
    height = 300,
    className
}: LocationMapProps) {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [zoom, setZoom] = useState(4);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [displayLocation, setDisplayLocation] = useState<string | null>(null);

    // --- Geocoding Logic ---
    useEffect(() => {
        let isMounted = true;

        const geocode = async () => {
            setIsLoading(true);
            setError(null);

            // 1. Build Query
            // Prefer "Title, Location" (e.g., "University of Ottawa, Ottawa")
            // Fallback to just "Location" (e.g., "Ottawa")
            // Fallback to just "Title" (e.g., "University of Ottawa")
            const queries = [];
            if (title && location) queries.push(`${title}, ${location}`);
            if (location) queries.push(location);
            if (title) queries.push(title);

            if (queries.length === 0) {
                if (isMounted) {
                    setError("No location info provided");
                    setIsLoading(false);
                }
                return;
            }

            try {
                let foundData: GeocodingResult | null = null;

                // Try queries in order until one works
                for (const q of queries) {
                    const res = await fetch(
                        `${GEOCODING_API}?q=${encodeURIComponent(q)}&format=json&limit=1`,
                        { headers: { 'User-Agent': 'RGAP-Research-App' } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.length > 0) {
                            foundData = data[0];
                            break; // Found it!
                        }
                    }
                }

                if (isMounted) {
                    if (foundData) {
                        const lat = parseFloat(foundData.lat);
                        const lon = parseFloat(foundData.lon);
                        setCoordinates([lat, lon]); // Leaflet uses [lat, lon]
                        setDisplayLocation(foundData.display_name);

                        // Heuristic for Zoom Level based on 'importance' (0.0 - 1.0)
                        // High importance (Countries) -> Zoom 4
                        // Med importance (Cities) -> Zoom 10
                        // Low importance (Buildings) -> Zoom 15
                        const imp = foundData.importance || 0.5;
                        if (imp > 0.7) setZoom(5);
                        else if (imp > 0.4) setZoom(11);
                        else setZoom(15);
                    } else {
                        setError("Location not found");
                    }
                }
            } catch (err) {
                console.error("Geocoding failed", err);
                if (isMounted) setError("Could not detect location");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        geocode();

        return () => { isMounted = false; };
    }, [title, location]);

    // --- Loading State ---
    if (isLoading) {
        return (
            <div
                style={{ height }}
                className={`w-full bg-slate-100 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 ${className}`}
            >
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="text-sm font-medium">Locating...</span>
            </div>
        );
    }

    // --- Error State ---
    if (error || !coordinates) {
        return (
            <div
                style={{ height }}
                className={`w-full bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 ${className}`}
            >
                <MapPin className="w-6 h-6 opacity-50" />
                <span className="text-sm">{error || "Location unavailable"}</span>
            </div>
        );
    }

    // --- Render Map ---
    return (
        <div className={`relative w-full rounded-lg overflow-hidden border border-slate-200 shadow-sm ${className}`} style={{ height }}>
            <MapContainer
                center={coordinates}
                zoom={zoom}
                scrollWheelZoom={false} // Disable scroll zoom for better UX on long pages
                style={{ height: "100%", width: "100%" }}
                attributionControl={false} // Cleaner look, minimal attribution
            >
                {/* OpenStreetMap Tiles (Free) */}
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Map Updater to handle props changes */}
                <MapUpdater center={coordinates} zoom={zoom} />

                <Marker position={coordinates} icon={createCustomIcon()}>
                    <Popup className="text-sm font-sans">
                        <strong>{title}</strong>
                        <br />
                        <span className="text-xs text-slate-500">{displayLocation}</span>
                    </Popup>
                </Marker>

                {/* Custom Attribution Overlay (Bottom Right) */}
                <div className="leaflet-bottom leaflet-right">
                    <div className="leaflet-control-attribution leaflet-control text-[10px] bg-white/80 px-1 mr-1 mb-1 rounded">
                        © OpenStreetMap
                    </div>
                </div>
            </MapContainer>
        </div>
    );
}
