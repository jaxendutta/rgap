// src/components/account/AccountManager.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FiShield, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import ProfileEditor from '@/components/account/ProfileEditor';
import PasswordManager from '@/components/account/PasswordManager';
import DeleteAccountSection from '@/components/account/DeleteAccountSection';
import SessionList from '@/components/account/SessionList';
import ActivityHistory from '@/components/account/ActivityHistory';
import SearchHistoryList from '@/components/account/SearchHistoryList';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { User, Session, AuditLog } from '@/types/database';
import { logoutAction } from '@/app/actions/auth';
import { MdLockReset } from 'react-icons/md';
import { BsPersonGear } from 'react-icons/bs';
import { TbClockSearch } from 'react-icons/tb';
import { RiProfileLine } from 'react-icons/ri';
import { importHistory } from '@/app/actions/history';
import { useNotify } from '@/providers/NotificationProvider';
import { SearchHistoryItem } from '@/types/search';

interface AccountManagerProps {
    user: User;
    sessions: Session[];
    auditLogs: AuditLog[];
    searchHistory: SearchHistoryItem[];
    currentSessionId?: string;

    // History Pagination
    totalHistoryCount: number;
    currentHistoryPage: number;

    // Activity Pagination & Sort
    totalActivityCount: number;
    currentActivityPage: number;
    currentActivitySort?: string;
    currentActivityDir?: 'asc' | 'desc';

    // Session Sort
    currentSessionSort?: string;
    currentSessionDir?: 'asc' | 'desc';

    initialTab?: string;
}

const TABS = [
    { id: 'profile', label: 'Profile', icon: RiProfileLine },
    { id: 'security', label: 'Security', icon: FiShield },
    { id: 'history', label: 'Search History', icon: TbClockSearch },
    { id: 'activity', label: 'Activity Log', icon: BsPersonGear },
    { id: 'sessions', label: 'Sessions', icon: MdLockReset },
] as const;

export default function AccountManager({
    user,
    sessions,
    auditLogs,
    searchHistory,
    currentSessionId,
    totalHistoryCount = 0,
    currentHistoryPage = 1,
    totalActivityCount = 0,
    currentActivityPage = 1,
    currentActivitySort = 'created_at',
    currentActivityDir = 'desc',
    currentSessionSort = 'created_at',
    currentSessionDir = 'desc',
    initialTab = 'profile'
}: AccountManagerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { notify } = useNotify();

    // Initialize state from URL param if available, otherwise prop, otherwise default
    const paramTab = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState<string>(
        (paramTab && TABS.some(t => t.id === paramTab)) ? paramTab : initialTab
    );

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleImportHistory = async (importedHistory: SearchHistoryItem[]) => {
        try {
            // Basic validation
            if (!Array.isArray(importedHistory)) {
                throw new Error('Invalid file format');
            }
            await importHistory(importedHistory);

            notify('Search history imported successfully.', 'success');

            router.refresh();

        } catch (error) {
            notify(error instanceof Error ? error.message : 'An unknown error occurred.', 'error');
        }
    };

    // Sync state with URL manually if user navigates back/forward
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && TABS.some(t => t.id === tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    // Handle Tab Change with URL update
    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setIsDropdownOpen(false);

        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);

        // Clean up pagination params for other tabs
        if (tabId !== 'history') params.delete('history_page');
        if (tabId !== 'activity') params.delete('activity_page');

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleSessionSort = (field: string) => {
        const params = new URLSearchParams(searchParams.toString());

        // Toggle direction if clicking same field, otherwise default to desc
        const newDir = (field === currentSessionSort && currentSessionDir === 'desc') ? 'asc' : 'desc';

        params.set('session_sort', field);
        params.set('session_dir', newDir);
        params.set('tab', 'sessions'); // Ensure we stay on correct tab

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handleActivitySort = (field: string) => {
        const params = new URLSearchParams(searchParams.toString());

        const newDir = (field === currentActivitySort && currentActivityDir === 'desc') ? 'asc' : 'desc';

        params.set('activity_sort', field);
        params.set('activity_dir', newDir);
        params.set('activity_page', '1'); // Reset to page 1 on sort
        params.set('tab', 'activity');

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

    const activeLabel = TABS.find(t => t.id === activeTab)?.label;

    return (
        <div className="flex flex-col md:gap-6 w-full">

            {/* --- HEADER ROW --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">

                <div className="flex flex-col text-center md:text-left gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hi, {user.name ? user.name.split(' ')[0] : 'there'}
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500">Manage your account settings here</p>
                </div>

                <div className="flex flex-col-reverse md:flex-row items-center gap-3 w-full lg:w-auto">

                    {/* MOBILE: Dropdown (< lg) */}
                    <div className="relative z-10 w-full lg:hidden" ref={dropdownRef}>
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
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors cursor-pointer
                                            ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
                                        `}
                                    >
                                        <tab.icon className="size-4" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DESKTOP: Pills Tabs (>= md) */}
                    <div className="hidden lg:block">
                        <Tabs
                            tabs={TABS.map(t => ({ ...t, id: t.id }))}
                            activeTab={activeTab}
                            onChange={handleTabChange}
                            variant="pills"
                        />
                    </div>

                    {/* Logout Button */}
                    <Button
                        variant="outline"
                        className="w-full bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 px-3 py-2 lg:w-fit"
                        title="Sign Out"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        <FiLogOut className="size-3.5 md:size-4 flex-shrink-0" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <ConfirmDialog
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={logoutAction}
                    title="Sign Out"
                    description="Are you sure you want to sign out of your account?"
                    confirmLabel="Sign Out"
                    variant="danger"
                />

                {activeTab === 'profile' && (
                    <Card className="p-4 md:p-8 rounded-3xl">
                        <ProfileEditor user={user} />
                    </Card>
                )}

                {activeTab === 'security' && (
                    <div className="flex flex-col gap-3 md:gap-6">
                        <Card className="p-4 md:p-8 rounded-3xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                            <PasswordManager />
                        </Card>
                        <DeleteAccountSection userEmail={user.email} />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="flex flex-col gap-4">
                        <SearchHistoryList
                            history={searchHistory}
                            totalCount={totalHistoryCount}
                            currentPage={currentHistoryPage}
                            onImportHistory={handleImportHistory}
                        />
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-gray-900 px-1">Activity Log</h3>
                        <ActivityHistory
                            logs={auditLogs}
                            totalCount={totalActivityCount}
                            currentPage={currentActivityPage}
                            currentSort={currentActivitySort}
                            currentDir={currentActivityDir}
                            onSort={handleActivitySort}
                        />
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">Your Active Sessions</h3>
                        <SessionList
                            sessions={sessions}
                            currentSessionId={currentSessionId}
                            currentSort={currentSessionSort}
                            currentDir={currentSessionDir}
                            onSort={handleSessionSort}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
