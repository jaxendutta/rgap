"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
    LuHouse,
    LuSearch,
    LuUniversity,
    LuGraduationCap,
    LuBookmark,
    LuUser,
} from "react-icons/lu";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);

    const { user } = useAuth();

    // Navigation config
    const mobileNavigation = [
        { name: "Institutes", icon: LuUniversity, href: "/institutes" },
        { name: "Recipients", icon: LuGraduationCap, href: "/recipients" },
        { name: "Search", icon: LuSearch, href: "/search" },
        { name: "Bookmarks", icon: LuBookmark, href: "/bookmarks" },
        { name: "Account", icon: LuUser, href: user ? "/account" : "/login" },
    ];

    const desktopNavigation = [
        { name: "Home", icon: LuHouse, href: "/" },
        { name: "Search", icon: LuSearch, href: "/search" },
        { name: "Institutes", icon: LuUniversity, href: "/institutes" },
        { name: "Recipients", icon: LuGraduationCap, href: "/recipients" },
        { name: "Bookmarks", icon: LuBookmark, href: "/bookmarks" },
        { name: "Account", icon: LuUser, href: user ? "/account" : "/login" },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:block fixed left-0 top-[64px] h-[calc(100vh-64px)] z-30",
                    "bg-white border-r border-gray-200 shadow-sm",
                    "transition-all duration-300 ease-in-out",
                    isExpanded ? "w-48" : "w-16"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <nav className="p-2 space-y-1">
                    {desktopNavigation.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center relative h-10 rounded-md transition-colors",
                                    isActive
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <div className="min-w-12 h-full flex items-center justify-center">
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div
                                    className={cn(
                                        "whitespace-nowrap overflow-hidden transition-opacity duration-300",
                                        isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    )}
                                >
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Spacer for Desktop Content */}
            <div className="hidden lg:block w-16 flex-shrink-0" />

            {/* Mobile Bottom Navigation - Apple "Liquid Glass" Style */}
            <div
                className={cn(
                    "lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe mx-1 mb-1.75",
                )}
            >
                <Tabs
                    tabs={mobileNavigation.map(item => ({ id: item.href, label: item.name, icon: item.icon }))}
                    activeTab={pathname}
                    onChange={(tabId) => router.push(tabId)}
                    variant="pills"
                    size="sm"
                    fullWidth
                    tabClassName="flex-col !py-1 !px-1"
                />
            </div>
        </>
    );
};

export default Sidebar;
