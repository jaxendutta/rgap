'use client';

import Link from 'next/link';
import { IconType } from 'react-icons';
import { LuSearch, LuChartBar, LuBookmark, LuShieldCheck, LuBookOpen } from 'react-icons/lu';

export default function DocsHomePage() {
    return (
        <div className="max-w-3xl">
            <div className="mb-4 md:mb-10 p-1">
                <h1 className="text-lg md:text-3xl font-bold tracking-tight text-gray-900 mb-1 md:mb-3">
                    Documentation
                </h1>
                <p className="text-sm md:text-lg text-gray-500 leading-relaxed">
                    Guides and references to help you navigate the Research Grant Analytics Platform.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DocCard 
                    href="/docs/intro"
                    title="Introduction"
                    description="The philosophy behind RGAP and data sources."
                    icon={LuBookOpen}
                />
                <DocCard 
                    href="/docs/account-setup"
                    title="Account & Security"
                    description="Setting up your profile and understanding privacy."
                    icon={LuShieldCheck}
                />
                <DocCard 
                    href="/docs/search"
                    title="Search Engine"
                    description="Mastering filters, keywords, and deep queries."
                    icon={LuSearch}
                />
                <DocCard 
                    href="/docs/analytics"
                    title="Analytics"
                    description="How to read the trends and funding charts."
                    icon={LuChartBar}
                />
                <DocCard 
                    href="/docs/bookmarks"
                    title="Bookmarks"
                    description="Curating your personal lists and notes."
                    icon={LuBookmark}
                />
            </div>
        </div>
    );
}

function DocCard({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: IconType }) {
    return (
        <Link 
            href={href}
            className="group flex flex-col p-3 md:p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200"
        >
            <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
                    <Icon className="size-4 md:size-4.5" />
                </div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">{title}</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
                {description}
            </p>
        </Link>
    );
}
