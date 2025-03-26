import React, { useState, useEffect } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";

// More detailed world map
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-50m.json";

// Nominatim geocoding API
const GEOCODING_API = "https://nominatim.openstreetmap.org/search";

interface LocationMapProps {
    locationString?: string;
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
    locationString,
    height = 300,
    width = "100%",
}) => {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(
        null
    );
    const [zoom, setZoom] = useState(4);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [locationDisplay, setLocationDisplay] = useState<string | null>(null);

    // Geocode location
    useEffect(() => {
        const geocodeLocation = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Check if we have a location string to geocode
                if (!locationString || locationString.trim() === "") {
                    throw new Error("No location provided");
                }

                // Make request to Nominatim API
                const response = await fetch(
                    `${GEOCODING_API}?q=${encodeURIComponent(
                        locationString
                    )}&format=json&limit=1`,
                    {
                        headers: {
                            // Add a referrer policy and user agent as per Nominatim usage policy
                            "Referrer-Policy": "no-referrer",
                            "User-Agent": "RGAP-Research-App",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Geocoding service unavailable");
                }

                const data = (await response.json()) as GeocodingResult[];

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);

                    setCoordinates([lon, lat]);
                    setLocationDisplay(data[0].display_name);

                    // Set appropriate zoom level based on importance
                    // Nominatim provides an importance score for each result
                    const importance = data[0].importance || 0.5;
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
    }, [locationString]);

    // If we have no location data at all or geocoding failed
    if (!locationString || error) {
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500 mr-3"></div>
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
                    style={{ width: "100%", height: "100%" }}
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

                        {/* Enhanced marker with labels */}
                        <Marker coordinates={coordinates}>
                            <g>
                                {/* Animated pulse effect */}
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
                <div className="text-center text-xs text-gray-500 truncate">
                    {locationDisplay}
                </div>
            )}
        </div>
    );
};

export default LocationMap;
