// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CircleArrowUp, User } from "lucide-react";
import { GiAbstract014 } from "react-icons/gi";
import { FaRegSun } from "react-icons/fa";

const Header = () => {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const mainContent = document.getElementById("main-content");
            if (mainContent) {
                // Show button if scrolled down more than 200px
                setShowScrollTop(mainContent.scrollTop > 200);
            }
        };

        const mainContent = document.getElementById("main-content");
        mainContent?.addEventListener("scroll", handleScroll);

        // Initial check
        handleScroll();

        return () => {
            mainContent?.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch("/api/auth/check", {
                    credentials: "include",
                });
                const data = await response.json();
                setIsLoggedIn(data.loggedIn);
            } catch (error) {
                console.error("Error checking authentication", error);
                setIsLoggedIn(false);
            }
        };

        checkAuth();
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
        <header className="shadow-sm">
            <div className="px-4 flex h-16 items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <Link href="/" className="flex items-center">
                        {/*<img
                            src="/rgap.svg"
                            alt="RGAP Logo"
                            className="h-5 w-5 mr-2"
                        />*/}
                        <GiAbstract014 className="h-6 w-6 text-gray-900 mr-2" />
                        <span className="text-xl font-semibold">[ RGAP ]</span>
                        <span className="hidden sm:inline ml-2 text-sm text-gray-600">
                            Research Grant Analytics Platform
                        </span>
                    </Link>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-1">
                    <button
                        className={`p-1 text-gray-600 hover:text-gray-800 transition-all duration-200 transform ${showScrollTop
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-1 pointer-events-none"
                            }`}
                        onClick={scrollToTop}
                        aria-label="Scroll to top"
                    >
                        <CircleArrowUp className="h-6 w-6" />
                    </button>

                    {/* Theme Toggle Placeholder */}
                    <Link
                        href="#"
                        className="p-1 text-gray-600 hover:text-gray-800"
                    >
                        <FaRegSun className="h-5 w-5" />
                    </Link>


                    <Link
                        href={isLoggedIn ? "/account" : "/login"}
                        className="p-1 text-gray-600 hover:text-gray-800"
                    >
                        <User className="h-6 w-6" />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header
