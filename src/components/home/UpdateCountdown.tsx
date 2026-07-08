"use client";

import { useEffect, useState } from "react";

interface Remaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function getRemaining(target: Date): Remaining {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    };
}

const pad = (n: number) => n.toString().padStart(2, "0");

// Plain text only, on purpose — this is meant to be dropped inside
// whatever element already carries the surrounding font/size/color.
export default function UpdateCountdown({ target }: { target: string }) {
    // Starts null so the server-rendered markup and the first client render match;
    // the live value is filled in after mount to avoid a hydration mismatch.
    const [remaining, setRemaining] = useState<Remaining | null>(null);

    useEffect(() => {
        const targetDate = new Date(target);
        setRemaining(getRemaining(targetDate));
        const interval = setInterval(() => {
            setRemaining(getRemaining(targetDate));
        }, 1000);
        return () => clearInterval(interval);
    }, [target]);

    if (!remaining) {
        return "--:--:--";
    }

    const { days, hours, minutes, seconds } = remaining;

    return `${days > 0 ? `${days}d ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
