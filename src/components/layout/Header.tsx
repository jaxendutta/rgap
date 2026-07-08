"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuBookOpen, LuCircleArrowUp, LuHouse } from "react-icons/lu";
import { GiAbstract014 } from "react-icons/gi";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_NAME } from "@/constants/site";
import { DOCS_NAV_ITEMS } from "@/constants/docs";
import Dropdown from "@/components/ui/Dropdown";
import { VscLibrary } from "react-icons/vsc";

interface HeaderProps {
    docsMode?: boolean;
}

const Header = ({ docsMode }: HeaderProps) => {
    const router = useRouter();
    const pathname = usePathname();

    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 200);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // 3. If we are on docs, render accordingly.
    if (pathname?.startsWith('/docs'))
        docsMode = true;

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 p-0.5 flex flex-col bg-white rounded-b-3xl shadow-md border border-white/20">
            <div className="flex items-center justify-between pointer-events-none">
                {/* Logo */}
                <div className="pointer-events-auto flex items-center justify-center space-x-2 px-4 py-1">
                    <Link href="/" className="flex items-center gap-1.5">
                        <GiAbstract014 className="h-4.5 w-4.5 text-gray-900" />
                        <span className="text-lg font-semibold text-gray-900">{SITE_NAME}</span>
                        {docsMode && (<span className="font-medium text-sm"> Docs</span>)}
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
                            href={docsMode ? "/" : "/docs"}
                            className="text-gray-600 hover:text-blue-600 transition-colors block"
                            aria-label={docsMode ? "Home" : "About & Documentation"}
                        >
                            {docsMode
                                ? <LuHouse className="size-5" />
                                : <LuBookOpen className="size-5" />
                            }
                        </Link>
                    </div>
                </motion.div>
            </div>

            {docsMode && (
                <div className="px-3 py-2">
                    {/* Dropdown Container */}
                    <Dropdown
                        value={pathname}
                        onChange={(value) => router.push(value)}
                        options={[
                            { value: "/docs", label: "Documentation Home", icon: VscLibrary },
                            ...DOCS_NAV_ITEMS.flatMap(section =>
                                section.items.map(item => ({
                                    value: item.href,
                                    label: item.title,
                                    icon: item.icon,
                                }))
                            )
                        ]}
                        fullWidth
                        className="w-full shadow-none border-gray-200"
                    />
                </div>
            )}
        </header>
    );
};

export default Header;
