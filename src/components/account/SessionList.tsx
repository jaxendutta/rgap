// src/components/account/SessionList.tsx
'use client';

import { FiSmartphone, FiMonitor, FiGlobe, FiLogOut } from 'react-icons/fi';
import { revokeSessionAction } from '@/app/actions/auth';
import { useNotify } from '@/providers/NotificationProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { ListHeader } from '@/components/ui/ListHeader';
import { Session } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { VscSignIn, VscSignOut } from 'react-icons/vsc';

export default function SessionList({ sessions, currentSessionId }: { sessions: Session[], currentSessionId?: string }) {
    const { notify } = useNotify();
    const router = useRouter();

    const handleRevoke = async (sessionId: string) => {
        const res = await revokeSessionAction(sessionId);
        if (res.success) {
            notify("Session logged out successfully", "success");
            router.refresh();
        } else {
            notify("Failed to log out session", "error");
        }
    };

    const parseUA = (ua: string | null) => {
        // ... (Keep existing parseUA logic) ...
        const agent = (ua || '').toLowerCase();

        let browser = 'Browser';
        let os = 'Unknown OS';
        let icon = FiMonitor;

        // Detect OS
        if (agent.includes('mobile') || agent.includes('android') || agent.includes('iphone')) {
            os = 'Mobile';
            icon = FiSmartphone;
        } else if (agent.includes('macintosh') || agent.includes('mac os')) {
            os = 'macOS';
        } else if (agent.includes('windows')) {
            os = 'Windows';
        } else if (agent.includes('linux')) {
            os = 'Linux';
        }

        // Detect Browser
        if (agent.includes('edg/')) {
            browser = 'Edge';
        } else if (agent.includes('chrome/') && !agent.includes('edg/')) {
            browser = 'Chrome';
        } else if (agent.includes('firefox/')) {
            browser = 'Firefox';
        } else if (agent.includes('safari/') && !agent.includes('chrome/')) {
            browser = 'Safari';
        }

        return { icon, name: `${browser} on ${os}` };
    };

    return (
        <div className="space-y-4">
            <ListHeader
                totalCount={sessions.length}
                showingCount={sessions.length}
                entityType="session"
                sortOptions={[
                    { label: "Log On", field: "date", direction: "desc", icon: VscSignIn, value: "date" },
                    { label: "Log Off", field: "last_active_at", direction: "desc", icon: VscSignOut, value: "last_active_at" }
                ]}
                currentSortField="date"
                currentSortDir="desc"
            />

            <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm overflow-x-auto rounded-3xl">
                <table className="min-w-full text-sm text-left whitespace-nowrap">
                    {/* ... (Keep existing table content) ... */}
                    <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                        <tr>
                            <th className="py-3 px-4 font-medium">Device</th>
                            <th className="py-3 px-4 font-medium">Location & IP</th>
                            <th className="py-3 px-4 font-medium">Activity</th>
                            <th className="py-3 px-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sessions.map((sess) => {
                            const device = parseUA(sess.user_agent);
                            const isCurrent = sess.session_id === currentSessionId;
                            const isRevoked = sess.is_revoked;

                            return (
                                <tr key={sess.session_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                                                <device.icon className="size-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{device.name}</p>
                                                <p className="text-xs text-gray-500 max-w-[200px] truncate" title={sess.user_agent || ''}>
                                                    {sess.user_agent || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <FiGlobe className="text-gray-400 flex-shrink-0" />
                                            <span>{sess.location || 'Unknown'}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">{sess.ip_address || 'Hidden'}</p>
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">
                                        <div className="flex flex-col gap-1">
                                            <Tag size="sm" text="Log On" innerText={formatDate(sess.created_at)} variant="success" className="w-fit" />
                                            {isRevoked && (
                                                <Tag size="sm" text="Log Off" innerText={formatDate(sess.last_active_at)} variant="warning" className="w-fit" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {isRevoked ? (<Tag size="sm" text="Logged Out" variant="secondary" />) : (
                                                <>
                                                    {isCurrent ? (<Tag size="sm" text="This Device" variant="primary" />) : (<Tag size="sm" text="Active" variant="success" />)}
                                                    {!isCurrent && (
                                                        <button
                                                            onClick={() => handleRevoke(sess.session_id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                            title="Log out this device"
                                                        >
                                                            <FiLogOut />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
