"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // 1. Import usePathname
import { LuCircleArrowUp, LuInfo } from "react-icons/lu";
import { GiAbstract014 } from "react-icons/gi";
import { AnimatePresence, motion } from "framer-motion";

const Header = () => {
    // 2. Get current path
    const pathname = usePathname();

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const mainContent = document.getElementById("main-content");
            if (mainContent) {
                setShowScrollTop(mainContent.scrollTop > 200);
            }
        };

        const mainContent = document.getElementById("main-content");
        mainContent?.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            mainContent?.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // 3. FIX: If we are on docs, DO NOT render this header.
    // The DocsLayout handles its own header.
    if (pathname?.startsWith('/docs')) return null;

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
            {/* Logo */}
            <div className="pointer-events-auto flex items-center justify-center space-x-2 px-4 py-1">
                <Link href="/" className="flex items-center">
                    <GiAbstract014 className="h-4.5 w-4.5 text-gray-900 mr-2" />
                    <span className="text-lg font-semibold text-gray-900">[ RGAP ]</span>
                </Link>
            </div>

            {/* Right Icons Container */}
            <motion.div
                layout
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

                <div className="p-2 px-3 flex-shrink-0">
                    <Link
                        href="/docs"
                        className="text-gray-600 hover:text-blue-600 transition-colors block"
                        aria-label="About & Documentation"
                    >
                        <LuInfo className="size-5" />
                    </Link>
                </div>
            </motion.div>
        </header>
    );
};

export default Header;
