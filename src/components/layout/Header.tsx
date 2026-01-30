// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LuCircleArrowUp, LuSun } from "react-icons/lu";
import { GiAbstract014 } from "react-icons/gi";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_NAME } from "@/constants/site";

const Header = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Note: Ensure your main scrolling element has the id 'main-content'
            // If using standard window scroll, change this logic to window.scrollY
            const mainContent = document.getElementById("main-content");
            if (mainContent) {
                setShowScrollTop(mainContent.scrollTop > 200);
            }
        };

        const mainContent = document.getElementById("main-content");
        mainContent?.addEventListener("scroll", handleScroll);
        handleScroll(); // Initial check

        return () => {
            mainContent?.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
            mainContent.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 p-0.5 flex items-center justify-between pointer-events-none bg-white rounded-b-3xl shadow-md border border-white/20">
            {/* Logo - Pointer events auto to allow clicking */}
            <div className="pointer-events-auto flex items-center justify-center space-x-2 px-4 py-1">
                <Link href="/" className="flex items-center">
                    <GiAbstract014 className="h-4.5 w-4.5 text-gray-900 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">{SITE_NAME}</span>
                </Link>
            </div>

            {/* Right Icons Container */}
            <motion.div
                layout // Animate the container's layout changes (width/background)
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="pointer-events-auto flex items-center overflow-hidden"
            >
                <AnimatePresence mode="popLayout">
                    {showScrollTop && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="flex items-center justify-center border-r border-gray-200/50"
                        >
                            <button
                                onClick={scrollToTop}
                                className="p-2 px-3 text-gray-600 hover:text-gray-900 transition-colors whitespace-nowrap"
                                aria-label="Scroll to top"
                            >
                                <LuCircleArrowUp className="size-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Theme Toggle Placeholder */}
                {/* flex-shrink-0 prevents this from getting squished during animation */}
                <div className="p-2 px-3 flex-shrink-0">
                    <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors block"                    >
                        <LuSun className="size-5" />
                    </Link>
                </div>
            </motion.div>
        </header>
    );
};

export default Header;
