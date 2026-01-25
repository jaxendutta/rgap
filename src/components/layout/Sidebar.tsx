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
    LuSun,
    LuLogIn
} from "react-icons/lu";
import { GiAbstract014 } from "react-icons/gi";
import Tabs from "@/components/ui/Tabs";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useNotify } from "@/providers/NotificationProvider";

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { notify } = useNotify();
    const { user } = useAuth();

    const [isExpanded, setIsExpanded] = useState(false);

    const accountItem = {
        name: user ? "Account" : "Sign In",
        icon: user ? LuUser : LuLogIn,
        href: user ? "/account" : "/login"
    };

    // Navigation config
    const mobileNavigation = [
        { name: "Institutes", icon: LuUniversity, href: "/institutes" },
        { name: "Recipients", icon: LuGraduationCap, href: "/recipients" },
        { name: "Search", icon: LuSearch, href: "/search" },
        { name: "Bookmarks", icon: LuBookmark, href: "/bookmarks" },
        accountItem,
    ];

    const desktopNavigation = [
        { name: "Home", icon: LuHouse, href: "/" },
        { name: "Search", icon: LuSearch, href: "/search" },
        { name: "Institutes", icon: LuUniversity, href: "/institutes" },
        { name: "Recipients", icon: LuGraduationCap, href: "/recipients" },
        { name: "Bookmarks", icon: LuBookmark, href: "/bookmarks" },
        accountItem,
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:block fixed left-0 top-0 h-screen z-30",
                    "bg-white border-r border-gray-200 shadow-sm",
                    "transition-all duration-300 ease-in-out",
                    isExpanded ? "w-48" : "w-16"
                )}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                <nav className="p-2 space-y-1 mt-2">
                    {desktopNavigation.map((item) => {
                        // Check strict equality OR if we are inside the account section
                        const isActive = pathname === item.href || (item.href === '/account' && pathname.startsWith('/account'));
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center relative h-10 rounded-3xl py-6 transition-colors",
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

                {/* ======================================================== */}
                {/* BRANDING SECTION (Sideways Text + Logo)                  */}
                {/* ======================================================== */}
                <div
                    className={cn(
                        "absolute bottom-16 left-0 right-0 flex flex-col items-center gap-4 py-4 overflow-hidden transition-opacity duration-300",
                        isExpanded ? "opacity-100" : "opacity-80"
                    )}
                >
                    {/* Rotated Text Container - Added rotate-180 to flip direction */}
                    <div className="flex flex-col items-center justify-center gap-4 rotate-180">
                        {/* Short Text "[ RGAP ]" */}
                        <span className="whitespace-nowrap text-lg font-bold tracking-widest text-gray-900 [writing-mode:vertical-rl] select-none mt-2">
                            [ RGAP ]
                        </span>

                        {/* Full Text */}
                        <span className="whitespace-nowrap text-[10px] tracking-[0.2em] text-gray-400 font-medium [writing-mode:vertical-rl] select-none uppercase">
                            Research Grant Analytics Platform
                        </span>
                    </div>

                    {/* Logo - Straight (Upright) */}
                    <div className="flex items-center justify-center mt-2 p-2 bg-gray-50 rounded-full">
                        <GiAbstract014 className="h-6 w-6 text-gray-900" />
                    </div>
                </div>

                {/* Theme Toggle Button */}
                <button
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 text-gray-400 hover:text-yellow-500 hover:bg-gray-100 rounded-full transition-colors"
                    title="Toggle Theme"
                >
                    <LuSun className="w-5 h-5" />
                </button>
            </aside>

            {/* Spacer for Desktop Content */}
            <div className="hidden lg:block w-16 flex-shrink-0" />

            {/* Mobile Bottom Navigation */}
            <div
                className={cn(
                    "lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe mx-3 mb-2",
                )}
            >
                <Tabs
                    tabs={mobileNavigation.map(item => ({ id: item.href, label: item.name, icon: item.icon }))}
                    activeTab={pathname}
                    onChange={(tabId) => {
                        if (tabId === '/bookmarks' && !user) {
                            notify("Please sign in to view bookmarks.", "info");
                            return;
                        }
                        router.push(tabId);
                    }}
                    variant="pills"
                    size="sm"
                    fullWidth
                    tabClassName="flex-col !py-1 !px-1"
                    className="border-1 border-white"
                />
            </div>
        </>
    );
};

export default Sidebar;
