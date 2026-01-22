// src/components/account/AccountManager.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiUser, FiShield, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs'; // Import the Tabs component you provided
import ProfileEditor from '@/components/account/ProfileEditor';
import PasswordManager from '@/components/account/PasswordManager';
import DeleteAccountSection from '@/components/account/DeleteAccountSection';
import SessionList from '@/components/account/SessionList';
import ActivityHistory from '@/components/account/ActivityHistory';
import SearchHistoryList from '@/components/account/SearchHistoryList';
import { User } from '@/types/database';
import { logoutAction } from '@/app/actions/auth';
import { MdLockReset } from 'react-icons/md';
import { RxActivityLog } from 'react-icons/rx';
import { TbClockSearch } from 'react-icons/tb';

interface AccountManagerProps {
    user: User;
    sessions: any[];
    auditLogs: any[];
    searchHistory: any[];
    currentSessionId?: string;
    totalHistoryCount: number; // Added
    currentHistoryPage: number; // Added
    initialSection?: string;
}

const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'history', label: 'Search History', icon: TbClockSearch },
    { id: 'activity', label: 'Activity Log', icon: RxActivityLog },
    { id: 'sessions', label: 'Sessions', icon: MdLockReset },
] as const;

export default function AccountManager({
    user,
    sessions,
    auditLogs,
    searchHistory,
    currentSessionId,
    totalHistoryCount = 0, // Default to 0 to prevent crash
    currentHistoryPage = 1,
    initialSection = 'profile'
}: AccountManagerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize state from URL param if available, otherwise prop, otherwise default
    const paramSection = searchParams.get('section');
    const [activeSection, setActiveSection] = useState<string>(
        (paramSection && SECTIONS.some(s => s.id === paramSection)) ? paramSection : initialSection
    );

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync state with URL manually if user navigates back/forward
    useEffect(() => {
        const section = searchParams.get('section');
        if (section && SECTIONS.some(s => s.id === section)) {
            setActiveSection(section);
        }
    }, [searchParams]);

    // Handle Tab Change with URL update
    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
        setIsDropdownOpen(false);

        // Update URL without full reload
        const params = new URLSearchParams(searchParams.toString());
        params.set('section', sectionId);
        // Reset history page when switching tabs if we are leaving history
        if (sectionId !== 'history') {
            params.delete('history_page');
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Close dropdown click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeLabel = SECTIONS.find(s => s.id === activeSection)?.label;

    return (
        <div className="flex flex-col gap-6 w-full">

            {/* --- HEADER ROW --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">

                <div className="flex flex-col text-center md:text-left gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hi, {user.name ? user.name.split(' ')[0] : 'there'}
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500">Manage your account settings here</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">

                    {/* MOBILE: Dropdown (< md) */}
                    <div className="relative z-10 w-full md:hidden" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 w-full bg-white border border-gray-200 rounded-3xl text-sm font-medium text-gray-700 hover:shadow-md transition-colors shadow-xs justify-between cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                {activeLabel}
                            </span>
                            <FiChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                                {SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => handleSectionChange(section.id)}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors cursor-pointer
                                            ${activeSection === section.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                                        `}
                                    >
                                        <section.icon className="size-4" />
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DESKTOP: Pills Tabs (>= md) */}
                    <div className="hidden md:block">
                        <Tabs
                            tabs={SECTIONS.map(s => ({ ...s, id: s.id }))}
                            activeTab={activeSection}
                            onChange={handleSectionChange}
                            variant="pills"
                            size="md"
                        />
                    </div>

                    {/* Logout Button */}
                    <Button
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 px-3 py-2 w-full md:w-auto shadow-xs"
                        title="Sign Out"
                        onClick={logoutAction}
                    >
                        <FiLogOut className="size-3.5 md:size-4" />
                        <span className="md:hidden">Sign Out</span>
                    </Button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
                {activeSection === 'profile' && (
                    <Card className="p-4 md:p-8 rounded-3xl">
                        <ProfileEditor user={user} />
                    </Card>
                )}

                {activeSection === 'security' && (
                    <div className="flex flex-col gap-6">
                        <Card className="p-4 md:p-8 rounded-3xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                            <PasswordManager />
                        </Card>
                        <DeleteAccountSection userEmail={user.email} />
                    </div>
                )}

                {activeSection === 'history' && (
                    <div className="flex flex-col gap-4">
                        <SearchHistoryList
                            history={searchHistory}
                            totalCount={totalHistoryCount}
                            currentPage={currentHistoryPage}
                        />
                    </div>
                )}

                {activeSection === 'activity' && (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 px-1">Activity Log</h3>
                        <ActivityHistory logs={auditLogs} />
                    </div>
                )}

                {activeSection === 'sessions' && (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">Your Active Sessions</h3>
                        <SessionList sessions={sessions} currentSessionId={currentSessionId} />
                    </div>
                )}
            </div>
        </div>
    );
}
