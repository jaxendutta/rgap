import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";
import { LoadingSpinner } from "./LoadingSpinner";

// More detailed world map
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

// Nominatim geocoding API
const GEOCODING_API = "https://nominatim.openstreetmap.org/search";

interface LocationMapProps {
    title: string;
    location?: string;
    height?: number;
    width?: string;
}

interface GeocodingResult {
    lat: string;
    lon: string;
    display_name: string;
    importance: number;
}

const LocationMap: React.FC<LocationMapProps> = ({
    title,
    location,
    height = 300,
    width = "100%",
}) => {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [zoom, setZoom] = useState(4);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationDisplay, setLocationDisplay] = useState<string | null>(null);

    // Geocode location
    useEffect(() => {
        const geocodeQuery = async (query: string) => {
            try {
                if (!query || query.trim() === "") {
                    return null;
                }

                const response = await fetch(
                    `${GEOCODING_API}?q=${encodeURIComponent(query)}&format=json&limit=1`,
                    {
                        headers: {
                            "Referrer-Policy": "no-referrer",
                            "User-Agent": "RGAP-Research-App",
                        },
                    }
                );

                if (!response.ok) {
                    return null;
                }

                const data = (await response.json()) as GeocodingResult[];
                return data && data.length > 0 ? data[0] : null;
            } catch (err) {
                console.error("Geocoding error for query:", query, err);
                return null;
            }
        };

        const geocodeLocation = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Check if we have location data to geocode
                if (!location && !title) {
                    throw new Error("No location information provided");
                }

                // First attempt: Try with title and location combined
                let result = null;
                if (title && location) {
                    result = await geocodeQuery(`${title}, ${location}`);
                }

                // Second attempt: Try with just location
                if (!result && location) {
                    result = await geocodeQuery(location);
                }

                // Third attempt: Try with just title as fallback
                if (!result && title) {
                    result = await geocodeQuery(title);
                }

                if (result) {
                    const lat = parseFloat(result.lat);
                    const lon = parseFloat(result.lon);

                    setCoordinates([lon, lat]);
                    setLocationDisplay(result.display_name);

                    // Set appropriate zoom level based on importance
                    const importance = result.importance || 0.5;
                    if (importance > 0.7) {
                        setZoom(3); // Country level
                    } else if (importance > 0.5) {
                        setZoom(4); // Region/province level
                    } else {
                        setZoom(5); // City level or more specific
                    }
                } else {
                    throw new Error("Location not found");
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Cannot detect location"
                );
                setCoordinates(null);
            } finally {
                setIsLoading(false);
            }
        };

        geocodeLocation();
    }, [title, location]);

    // If we have no location data at all or geocoding failed
    if ((!location && !title) || error) {
        return (
            <div
                style={{ width, height }}
                className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm"
            >
                {error || "Cannot detect location"}
            </div>
        );
    }

    // If still loading
    if (isLoading) {
        return (
            <div
                style={{ width, height }}
                className="flex items-center justify-center bg-gray-100 text-gray-500 text-sm"
            >
                <div className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-3" />
                    <span>Locating...</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ width, height }}>
            {coordinates ? (
                <ComposableMap
                    projection="geoMercator"
                    style={{ width: "100%", height: "97.5%" }}
                >
                    <ZoomableGroup center={coordinates} zoom={zoom}>
                        <Geographies geography={geoUrl}>
                            {({ geographies }) =>
                                geographies.map((geo) => (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill="#E8EAED"
                                        stroke="#D4D8DD"
                                        strokeWidth={0.5}
                                        style={{
                                            default: { outline: "none" },
                                            hover: {
                                                fill: "#CBD5E1",
                                                outline: "none",
                                            },
                                            pressed: { outline: "none" },
                                        }}
                                    />
                                ))
                            }
                        </Geographies>

                        <Marker coordinates={coordinates}>
                            <g>
                                <circle
                                    r="10"
                                    className="fill-blue-500 opacity-20 animate-pulse"
                                />
                                <circle
                                    r="6"
                                    className="fill-blue-500 opacity-30 animate-pulse"
                                />
                                <circle
                                    r="3"
                                    className="fill-blue-500 animate-pulse"
                                />
                            </g>
                        </Marker>
                    </ZoomableGroup>
                </ComposableMap>
            ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
                    Cannot display location map
                </div>
            )}

            {locationDisplay && (
                <div className="py-1 text-center text-xs text-gray-500 truncate">
                    {locationDisplay}
                </div>
            )}
        </div>
    );
};

export default LocationMap;
