// src/components/entity/LocationMapDropdown.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LuMapPin, LuChevronDown, LuX, LuLoader } from 'react-icons/lu';
import { Button } from '@/components/ui/Button';
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
                className="inline-flex items-center gap-1.5 font-medium rounded-full text-xs md:text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all cursor-pointer shadow-xs group"
                title="Click to view map location"
            >
                <LuMapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>{location}</span>
                <LuChevronDown className={cn("h-3.5 w-3.5 text-blue-500 transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
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
                        <div className="w-full p-3 sm:p-4 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                            {/* Pane Header */}
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2 overflow-hidden pr-2">
                                    <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                                        <LuMapPin className="h-4 w-4" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs font-semibold text-gray-900 truncate">
                                            {instituteName}
                                        </p>
                                        <p className="text-[11px] text-gray-500 truncate">
                                            {location}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-7 w-7 p-0 rounded-full hover:bg-gray-200 text-gray-500"
                                >
                                    <LuX className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Full Width Map Frame */}
                            <div className="w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 relative flex items-center justify-center">
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
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={osmEmbedUrl}
                                        className="w-full h-full rounded-xl"
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationMapDropdown;
