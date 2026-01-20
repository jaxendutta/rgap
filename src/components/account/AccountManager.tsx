'use client';

import { useState, useRef, useEffect } from 'react';
import { FiUser, FiShield, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
}

// Section Definitions
const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'security', label: 'Security Settings', icon: FiShield },
    { id: 'history', label: 'Search History', icon: TbClockSearch },
    { id: 'activity', label: 'Activity Log', icon: RxActivityLog },
    { id: 'sessions', label: 'Active Sessions', icon: MdLockReset },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

export default function AccountManager({ user, sessions, auditLogs, searchHistory, currentSessionId }: AccountManagerProps) {
    const [activeSection, setActiveSection] = useState<SectionId>('profile');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
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

                {/* Greeting */}
                <div className="flex flex-col text-center md:text-left gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Hi, {user.name ? user.name.split(' ')[0] : 'there'}
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500">Manage your account settings here</p>
                </div>

                {/* Controls: Dropdown & Logout */}
                <div className="flex flex-row-reverse md:flex-row items-center gap-3">

                    {/* Custom Dropdown */}
                    <div className="relative z-10" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-3xl text-sm font-medium text-gray-700 hover:shadow-md transition-colors shadow-xs min-w-[180px] justify-between cursor-pointer"
                        >
                            <span className="flex items-center gap-2">
                                {activeLabel}
                            </span>
                            <FiChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            setIsDropdownOpen(false);
                                        }}
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

                    {/* Logout Button */}
                    <Button
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 hover:border-red-200 px-3 py-2 w-full shadow-xs"
                        title="Sign Out"
                        onClick={logoutAction}
                    >
                        <FiLogOut className="size-3.5 md:size-4" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

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
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-semibold text-gray-900">Your Search History</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{searchHistory.length} records</span>
                        </div>
                        <SearchHistoryList history={searchHistory} />
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
