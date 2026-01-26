"use client";
// src/app/(dashboard)/loading.tsx
import LoadingState from "@/components/ui/LoadingState";
import { useEffect, useState } from "react";

export default function DashboardLoading() {
    const LOADING_SUBTITLES = [
        "Convincing Excel to do math...",
        "Bribing the database with coffee...",
        "Asking nicely for the data to cooperate...",
        "Teaching numbers to behave...",
        "Translating binaries to human...",
        "Counting all the zeroes in those grant figures...",
        "Negotiating with the matplotlib griffins...",
        "Herding data like cats...",
        "Waiting for the grants to align in formation...",
        "Performing arcane database rituals...",
        "Convincing the server it's not nap time...",
        "Searching through mountains of paperwork (digitally)...",
        "Making sure we didn't lose any millions...",
        "Double-checking the decimal places...",
        "Time-traveling through fiscal years...",
        "Consulting the research funding crystal ball...",
        "Asking the RGAP overlords very nicely...",
        "Downloading the latest conspiracy theories... wait, wrong app...",
        "Calculating how many PhDs this could fund...",
        "Pretending we understand these numbers...",
        "Loading... (yes, still loading)...",
        "Spinning up the hamster wheel powering our servers...",
        "Converting grant money into pixels...",
        "Defragmenting the funding database...",
        "Summoning data from the cloud (literally)...",
    ];

    const [subtitle, setSubtitle] = useState(LOADING_SUBTITLES[0]);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setSubtitle(LOADING_SUBTITLES[Math.floor(Math.random() * LOADING_SUBTITLES.length)]);
                setFading(false);
            }, 500); // Should match the transition duration
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <LoadingState
            title="Loading..."
            message={subtitle}
            fullHeight
            size="lg"
            spinnerSize={30}
            messageClassName={`transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
        />
    );
}
