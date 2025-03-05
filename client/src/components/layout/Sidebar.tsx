// src/components/common/layout/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import {
    Home,
    Search,
    University,
    GraduationCap,
    Bookmark,
    BookOpen,
} from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";

// Reordered for mobile
const mobileNavigation = [
    { name: "Support", icon: BookOpen, href: "/docs" },
    { name: "Institutes", icon: University, href: "/institutes" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Recipients", icon: GraduationCap, href: "/recipients" },
    { name: "Saves", icon: Bookmark, href: "/bookmarks" },
];

// Original order for desktop
const desktopNavigation = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Search", icon: Search, href: "/search" },
    { name: "Institutes", icon: University, href: "/institutes" },
    { name: "Recipients", icon: GraduationCap, href: "/recipients" },
    { name: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
    { name: "Support", icon: BookOpen, href: "/docs" },
];

const Sidebar = () => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={clsx(
                    "hidden lg:block bg-gray-50 border-r min-h-screen transition-all duration-300 ease-in-out",
                    isExpanded ? "w-48" : "w-16"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <nav className="p-2 space-y-1">
                    {desktopNavigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={clsx(
                                    "flex items-center relative h-12 rounded-lg",
                                    isActive
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                <div className="w-12 flex items-center justify-center absolute left-0 top-0 h-full">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div
                                    className={clsx(
                                        "transition-opacity duration-300 pl-12 py-3 whitespace-nowrap",
                                        isExpanded
                                            ? "opacity-100 visible"
                                            : "opacity-0 invisible"
                                    )}
                                >
                                    {item.name}
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </div>
            {/* Mobile Bottom Navigation - Fixed to bottom with proper spacing */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <nav className="max-w-md mx-auto px-2">
                    <div className="flex items-center justify-between h-16">
                        {mobileNavigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={clsx(
                                        "flex flex-col items-center justify-center flex-1",
                                        "active:scale-95 transition-transform",
                                        isActive
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                    )}
                                >
                                    <Icon
                                        className={clsx(
                                            "h-6 w-6 mb-1",
                                            isActive
                                                ? "text-gray-900"
                                                : "text-gray-500"
                                        )}
                                    />
                                    <span
                                        className={clsx(
                                            "text-xs font-medium",
                                            isActive
                                                ? "text-gray-900"
                                                : "text-gray-500"
                                        )}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>
            {/* Padding element to prevent content from being hidden - added to the main layout */}
            <div className="lg:hidden pb-20" />{" "}
            {/* Increased padding to prevent content hiding */}
        </>
    );
};

export default Sidebar;
