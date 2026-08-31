// src/components/entity/LocationMapDropdown.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LuMapPin, LuChevronDown, LuLoader } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export interface LocationMapDropdownProps {
    instituteName: string;
    location: string;
    className?: string;
}

interface Coords {
    lat: number;
    lon: number;
    displayName: string;
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
}

export const LocationMapDropdown: React.FC<LocationMapDropdownProps> = ({
    instituteName,
    location,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coords, setCoords] = useState<Coords | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    const searchQuery = `${instituteName}, ${location}`;

    // Fetch lat/lon from our server API endpoint when opened
    useEffect(() => {
        if (!isOpen || fetchedRef.current) return;

        fetchedRef.current = true;
        setLoading(true);
        setError(null);

        const url = `/api/geocode?q=${encodeURIComponent(searchQuery)}&institute=${encodeURIComponent(instituteName)}&location=${encodeURIComponent(location)}`;

        fetch(url)
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error('Location not found');
                }
                const data = await res.json();
                setCoords(data);
            })
            .catch((err) => {
                console.error('Failed to geocode location:', err);
                setError('Unable to load map location.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isOpen, instituteName, location, searchQuery]);

    // Reset fetch ref if institute or location changes
    useEffect(() => {
        fetchedRef.current = false;
        setCoords(null);
        setError(null);
    }, [instituteName, location]);

    // Construct embed URL with literal commas (crucial for OpenStreetMap iframe URL parser)
    const osmEmbedUrl = coords
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.minLon},${coords.minLat},${coords.maxLon},${coords.maxLat}&layer=mapnik&marker=${coords.lat},${coords.lon}`
        : '';

    return (
        <div className={cn("contents", className)}>
            {/* The Location Tag itself acts as the Interactive Map Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center font-medium gap-1 max-w-full group bg-gray-100 text-blue-600 hover:text-blue-700 text-xs md:text-sm rounded-full cursor-pointer hover:opacity-90 active:opacity-80 transition-all"
                title="Click to view map location"
            >
                <div className="flex flex-row gap-0.75 md:gap-1 items-center justify-center px-3.5 py-1 flex-1 pr-0">
                    <LuMapPin className="size-3 md:size-4 mr-0.5 md:mr-1 flex-shrink-0 text-blue-600 group-hover:text-blue-700" />
                    <span>{location}</span>
                </div>
                <LuChevronDown
                    className={cn(
                        "size-3.5 md:size-4 flex text-blue-400 flex-shrink-0 transition-transform duration-300 ease-in-out group-hover:text-blue-600 mr-1",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden w-full mt-3 basis-full"
                    >
                        {/* Direct Map Frame */}
                        <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative flex items-center justify-center shadow-xs">
                            {loading && (
                                <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-12">
                                    <LuLoader className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="text-xs font-medium">Locating on OpenStreetMap...</span>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="text-center p-4 text-gray-600 space-y-2">
                                    <p className="text-xs">{error}</p>
                                </div>
                            )}

                            {!loading && coords && (
                                <iframe
                                    title={`Map of ${instituteName}`}
                                    src={osmEmbedUrl}
                                    className="w-full h-full rounded-2xl border-0"
                                    loading="lazy"
                                    allowFullScreen
                                    aria-hidden="false"
                                    tabIndex={0}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationMapDropdown;
