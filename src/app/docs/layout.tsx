'use client';

import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { DOCS_NAV_ITEMS } from "@/constants/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <PageContainer className="flex flex-col lg:flex-row">
            {/* 1. Main Sidebar (Has 'peer' class) */}
            <Sidebar />

            {/* 2. Desktop Docs Navigation */}
            {/* Added: peer-hover:left-48 and transition-all to slide it */}
            <div className="hidden lg:block w-64 fixed left-16 top-0 bottom-0 border-r border-gray-200 bg-white overflow-y-auto p-6 z-20 transition-all duration-300 peer-hover:left-48">
                <div className="mb-8 pt-2">
                    <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        Docs
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">RGAP User Guide v1.0</p>
                </div>

                <nav className="space-y-8">
                    {DOCS_NAV_ITEMS.map((section) => (
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

            {/* 3. Content Area */}
            <Card className="mt-8 lg:mt-0 lg:ml-50 transition-all duration-300 peer-hover:lg:ml-80 rounded-3xl shadow-sm border border-gray-100 px-4 py-3 md:p-12">
                {children}
            </Card>
        </PageContainer>
    );
}
