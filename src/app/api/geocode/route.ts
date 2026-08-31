// src/app/api/geocode/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const instituteName = searchParams.get('institute');
    const location = searchParams.get('location');

    if (!query && !instituteName && !location) {
        return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
    }

    const userAgent = 'rgap-app/1.0 (contact@rgap.org)';

    const tryGeocode = async (q: string) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
                {
                    headers: {
                        'User-Agent': userAgent,
                        'Accept-Language': 'en',
                    },
                    next: { revalidate: 86400 }, // Cache for 24h
                }
            );
            if (!res.ok) return null;
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                return data[0];
            }
        } catch (err) {
            console.error(`Geocode error for query "${q}":`, err);
        }
        return null;
    };

    // Attempt 1: Full Query
    let result = query ? await tryGeocode(query) : null;

    // Attempt 2: Institute name alone
    if (!result && instituteName) {
        result = await tryGeocode(instituteName);
    }

    // Attempt 3: Location alone
    if (!result && location) {
        result = await tryGeocode(location);
    }

    if (!result) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    let minLat = lat - 0.012;
    let maxLat = lat + 0.012;
    let minLon = lon - 0.012;
    let maxLon = lon + 0.012;

    if (result.boundingbox && result.boundingbox.length === 4) {
        minLat = parseFloat(result.boundingbox[0]);
        maxLat = parseFloat(result.boundingbox[1]);
        minLon = parseFloat(result.boundingbox[2]);
        maxLon = parseFloat(result.boundingbox[3]);
    }

    return NextResponse.json({
        lat,
        lon,
        minLat,
        maxLat,
        minLon,
        maxLon,
        displayName: result.display_name,
    });
}
