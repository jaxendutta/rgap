'use client';

import { FiSmartphone, FiMonitor, FiGlobe, FiLogOut } from 'react-icons/fi';
import { revokeSessionAction } from '@/app/actions/auth';
import { useNotify } from '@/providers/NotificationProvider';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import Tag from '../ui/Tag';

interface Session {
    session_id: string;
    created_at: string;
    last_active_at: string;
    user_agent: string | null;
    ip_address: string | null;
    location: string | null;
    is_revoked: boolean;
}

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
        const agent = (ua || '').toLowerCase();
        if (agent.includes('mobile')) return { icon: FiSmartphone, name: 'Mobile' };
        if (agent.includes('mac')) return { icon: FiMonitor, name: 'Mac OS' };
        if (agent.includes('windows')) return { icon: FiMonitor, name: 'Windows' };
        if (agent.includes('linux')) return { icon: FiMonitor, name: 'Linux' };
        return { icon: FiMonitor, name: 'Browser' };
    };

    // Helper to format date consistent with UI needs
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        });
    };

    return (
        <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm text-left whitespace-nowrap">
                <thead className="text-gray-500 border-b border-gray-200">
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
                                            <device.icon />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{device.name}</p>
                                            <p className="text-xs text-gray-500 max-w-[300px] whitespace-normal" title={sess.user_agent || ''}>
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
    );
}
