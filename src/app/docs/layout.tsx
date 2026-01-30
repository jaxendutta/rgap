'use client';

import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuBookOpen } from "react-icons/lu";
import { Dropdown } from "@/components/ui/Dropdown";

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
        <div className="flex flex-col lg:flex-row">
            {/* 1. Main App Sidebar */}
            <Sidebar />

            {/* 2. Desktop Docs Sidebar (Fixed width) */}
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

            {/* 3. Mobile Navigation (Visible only on small screens) */}
            <div className="lg:hidden p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center gap-2 mb-2">
                    <LuBookOpen className="text-blue-600" />
                    <span className="font-semibold text-gray-900">Documentation</span>
                </div>
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
            <main className="flex-1 lg:ml-50 p-2 md:p-4 max-w-5xl pb-24">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-12 min-h-[80vh]">
                    {children}
                </div>
            </main>
        </div>
    );
}
