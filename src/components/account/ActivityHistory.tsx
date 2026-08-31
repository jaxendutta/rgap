// src/components/account/ActivityHistory.tsx
'use client';

import React from 'react';
import { FiEdit2, FiLock, FiMail, FiLogIn, FiClock, FiBookmark, FiTrash2 } from 'react-icons/fi';
import { SlSocialDropbox } from 'react-icons/sl';
import { MdLockReset } from 'react-icons/md';
import { Card } from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import { Pagination } from '@/components/ui/Pagination';
import { ListHeader } from '@/components/ui/ListHeader';
import { AuditLog } from '@/types/database';
import { formatDateTime } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ActivityHistoryProps {
    logs: AuditLog[];
    totalCount: number;
    currentPage: number;
    currentSort?: string;
    currentDir?: 'asc' | 'desc';
    onSort?: (field: string) => void;
}

export default function ActivityHistory({
    logs,
    totalCount,
    currentPage,
    currentSort,
    currentDir,
    onSort
}: ActivityHistoryProps) {
    const router = useRouter();

    const getIcon = (type: string) => {
        if (type.startsWith('REMOVE_BOOKMARK')) return FiTrash2;
        if (type.startsWith('BOOKMARK')) return FiBookmark;
        switch (type) {
            case 'PASSWORD_CHANGE': return FiLock;
            case 'PASSWORD_RESET': return MdLockReset;
            case 'EMAIL_CHANGE': return FiMail;
            case 'NAME_CHANGE': return FiEdit2;
            case 'LOGIN': return FiLogIn;
            default: return FiClock;
        }
    };

    const formatText = (log: AuditLog) => {
        switch (log.event_type) {
            case 'PASSWORD_CHANGE': return "Changed password";
            case 'PASSWORD_RESET': return "Reset password";
            case 'EMAIL_CHANGE': return "Changed email";
            case 'NAME_CHANGE': return "Renamed account";
            case 'BOOKMARK_GRANT': return "Bookmarked Grant";
            case 'REMOVE_BOOKMARK_GRANT': return "Unbookmarked Grant";
            case 'BOOKMARK_RECIPIENT': return "Bookmarked Recipient";
            case 'REMOVE_BOOKMARK_RECIPIENT': return "Unbookmarked Recipient";
            case 'BOOKMARK_INSTITUTE': return "Bookmarked Institute";
            case 'REMOVE_BOOKMARK_INSTITUTE': return "Unbookmarked Institute";
            default: return log.event_type.replace(/_/g, ' ').toLowerCase();
        }
    };

    const getLinkForEvent = (log: AuditLog) => {
        const type = log.event_type;
        const name = log.new_value || log.old_value;

        if (!name) return null;

        if (type.includes('GRANT')) return { href: '/bookmarks?tab=grants', label: "Grant ID: " + name };
        if (type.includes('RECIPIENT')) return { href: `/recipients/${name}`, label: "Recipient ID: " + name };
        if (type.includes('INSTITUTE')) return { href: `/institutes/${name}`, label: "Institute ID: " + name };

        return null;
    };

    if (logs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <SlSocialDropbox className="mx-auto mb-4 size-10" />
                No activity recorded yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ListHeader
                totalCount={totalCount}
                showingCount={logs.length}
                entityType="activity"
                sortOptions={[
                    { label: "Date", field: "created_at", direction: "desc", icon: FiClock, value: "created_at" }
                ]}
                currentSortField={currentSort}
                currentSortDir={currentDir}
                onSort={onSort}
            />

            <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm overflow-x-auto rounded-3xl">
                <table className="min-w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-gray-500 border-b border-gray-200 bg-gray-50/50">
                        <tr>
                            <th className="py-4 px-6 font-medium w-[25%]">Action</th>
                            <th className="py-4 px-6 font-medium w-[35%] text-center">Details</th>
                            <th className="py-4 px-6 font-medium w-[20%] text-center">IP Address</th>
                            <th className="py-4 px-6 font-medium w-[20%] text-right">Date & Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log, i) => {
                            const linkData = getLinkForEvent(log);

                            return (
                                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-full text-gray-600">
                                                {React.createElement(getIcon(log.event_type), { className: "size-4" })}
                                            </div>
                                            <span className="font-medium text-gray-900 capitalize">{formatText(log)}</span>
                                        </div>
                                    </td>

                                    <td className="py-4 px-6 align-middle">
                                        <div className="flex justify-center">
                                            {linkData ? (
                                                <Tag
                                                    size="sm"
                                                    text={linkData.label}
                                                    variant="link"
                                                    onClick={() => router.push(linkData.href)}
                                                    className="group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors cursor-pointer"
                                                />
                                            ) : (
                                                <div className="flex flex-wrap items-center justify-center gap-2">
                                                    {log.old_value && (
                                                        <Tag size="xs" text="From" innerText={log.old_value} variant="secondary" className="w-fit" />
                                                    )}
                                                    {log.new_value && (
                                                        <Tag size="xs" text="To" innerText={log.new_value} variant="primary" className="w-fit" />
                                                    )}
                                                    {!log.old_value && !log.new_value && (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    <td className="py-4 px-6 align-middle text-center">
                                        <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                                            {log.ip_address || 'Unknown'}
                                        </span>
                                    </td>

                                    <td className="py-4 px-6 align-middle text-right">
                                        <span className="text-gray-500 font-mono text-xs">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Card>

            <Pagination
                totalCount={totalCount}
                currentPage={currentPage}
                paramName="activity_page"
            />
        </div>
    );
}
