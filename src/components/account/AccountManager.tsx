'use client';

import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import { FiActivity, FiMonitor, FiSettings } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import ProfileEditor from '@/components/account/ProfileEditor';
import PasswordManager from '@/components/account/PasswordManager';
import DeleteAccountSection from '@/components/account/DeleteAccountSection';
import SessionList from '@/components/account/SessionList';
import ActivityHistory from '@/components/account/ActivityHistory';
import { User } from '@/types/database';

interface AccountManagerProps {
    user: User;
    sessions: any[];
    auditLogs: any[];
    currentSessionId?: string;
}

export default function AccountManager({ user, sessions, auditLogs, currentSessionId }: AccountManagerProps) {
    const [activeTab, setActiveTab] = useState('details');

    const tabs = [
        { id: 'details', label: 'Settings', icon: FiSettings },
        { id: 'activity', label: 'Activity', icon: FiActivity },
        { id: 'sessions', label: 'Sessions', icon: FiMonitor },
    ];

    return (
        <div className="flex flex-col gap-6 md:gap-8 w-full">
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
                size="md"
                fullWidth
            />

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* TAB 1: DETAILS */}
                {activeTab === 'details' && (
                    <div className="flex flex-col gap-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card className="p-4 md:p-6">
                                <ProfileEditor user={user} />
                            </Card>
                            <Card className="p-4 md:p-6">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Security</h3>
                                <PasswordManager />
                            </Card>
                        </div>
                        <DeleteAccountSection userEmail={user.email} />
                    </div>
                )}

                {/* TAB 2: ACTIVITY */}
                {activeTab === 'activity' && (<ActivityHistory logs={auditLogs} />)}

                {/* TAB 3: SESSIONS */}
                {activeTab === 'sessions' && (<SessionList sessions={sessions} currentSessionId={currentSessionId} />)}
            </div>
        </div>
    );
}
