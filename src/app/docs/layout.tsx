'use client';

import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuHouse } from "react-icons/lu";
import { GiAbstract014 } from "react-icons/gi";
import Dropdown from "@/components/ui/Dropdown";
import { SITE_NAME } from "@/constants/site";
import PageContainer from "@/components/layout/PageContainer";

const docSections = [
    {
        title: "Getting Started",
        items: [
            { title: "Introduction", href: "/docs/intro" },
            { title: "Account & Security", href: "/docs/account-setup" },
        ]
    },
    {
        title: "Platform Features",
        items: [
            { title: "Search & Filters", href: "/docs/search" },
            { title: "Analytics Engine", href: "/docs/analytics" },
            { title: "Bookmarks", href: "/docs/bookmarks" },
        ]
    }
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <PageContainer className="flex flex-col lg:flex-row">
            {/* 1. Main Sidebar in Docs Mode */}
            <Sidebar />

            {/* 2. Desktop Docs Navigation (Sidebar List) */}
            <div className="hidden lg:block w-64 fixed left-16 top-0 bottom-0 border-r border-gray-200 bg-white overflow-y-auto p-6 z-20">
                <div className="mb-8 pt-2">
                    <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        Docs
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">RGAP User Guide v1.0</p>
                </div>

                <nav className="space-y-8">
                    {docSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.href}>
                                            <Link
                                                href={item.href}
                                                className={`text-sm hover:translate-x-1 transition-all block py-1 ${isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600'
                                                    }`}
                                            >
                                                {item.title}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            {/* 3. Mobile Docs Header (Extended) */}
            <div className="lg:hidden bg-white border-b border-gray-200 absolute fixed left-0 right-0 top-0 z-40 pb-3 pt-1 px-3 shadow-sm rounded-b-3xl">
                {/* Top Row: Logo & Home Button */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-lg">
                        <GiAbstract014 className="text-gray-900 size-4.5" />
                        <span className="font-semibold text-gray-900 items-end">{SITE_NAME}</span> [ Docs ]
                    </div>
                    <Link href="/" className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 rounded-full">
                        <LuHouse className="w-5 h-5" />
                    </Link>
                </div>

                {/* Extended Dropdown Area */}
                <Dropdown
                    value={pathname}
                    onChange={(value) => router.push(value)}
                    options={[
                        { value: "/docs", label: "Documentation Home" },
                        ...docSections.flatMap(section =>
                            section.items.map(item => ({
                                value: item.href,
                                label: item.title
                            }))
                        )
                    ]}
                    fullWidth
                />
            </div>

            {/* 4. Content Area */}
            <div className="mt-12 lg:mt-0 lg:ml-50 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-12">
                {children}
            </div>
        </PageContainer>
    );
}
