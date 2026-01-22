// src/components/account/ActivityHistory.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FiEdit2, FiLock, FiMail, FiLogIn, FiClock, FiBookmark, FiTrash2 } from 'react-icons/fi';
import { SlSocialDropbox } from 'react-icons/sl';
import { Card } from '@/components/ui/Card';
import Tag from '../ui/Tag';

interface AuditLog {
    event_type: string;
    old_value: string | null;
    new_value: string | null;
    created_at: string;
    ip_address?: string;
}

export default function ActivityHistory({ logs }: { logs: AuditLog[] }) {
    // Hydration fix: Only render local dates after mounting on the client
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getIcon = (type: string) => {
        if (type.startsWith('REMOVE_BOOKMARK')) return FiTrash2;
        if (type.startsWith('BOOKMARK')) return FiBookmark;

        switch (type) {
            case 'PASSWORD_CHANGE': return FiLock;
            case 'EMAIL_CHANGE': return FiMail;
            case 'NAME_CHANGE': return FiEdit2;
            case 'LOGIN': return FiLogIn;
            default: return FiClock;
        }
    };

    const getStyle = (type: string) => {
        if (type.startsWith('REMOVE_BOOKMARK')) return 'bg-red-50 border-red-200 text-red-700';
        if (type.startsWith('BOOKMARK')) return 'bg-indigo-50 border-indigo-200 text-indigo-700';

        switch (type) {
            case 'PASSWORD_CHANGE': return 'bg-orange-50 border-orange-200 text-orange-700';
            case 'EMAIL_CHANGE': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'NAME_CHANGE': return 'bg-purple-50 border-purple-200 text-purple-700';
            case 'LOGIN': return 'bg-green-50 border-green-200 text-green-700';
            default: return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    }

    const formatText = (log: AuditLog) => {
        switch (log.event_type) {
            case 'PASSWORD_CHANGE': return "Changed password";
            case 'EMAIL_CHANGE': return "Changed email";
            case 'NAME_CHANGE': return "Renamed account";
            case 'BOOKMARK_GRANT': return "Bookmarked Grant";
            case 'REMOVE_BOOKMARK_GRANT': return "Removed Grant Bookmark";
            case 'BOOKMARK_RECIPIENT': return "Bookmarked Recipient";
            case 'REMOVE_BOOKMARK_RECIPIENT': return "Removed Recipient Bookmark";
            case 'BOOKMARK_INSTITUTE': return "Bookmarked Institute";
            case 'REMOVE_BOOKMARK_INSTITUTE': return "Removed Institute Bookmark";
            default: return log.event_type.replace(/_/g, ' ').toLowerCase();
        }
    };

    // Safe date formatter that returns a consistent server string initially
    const formatDate = (dateString: string) => {
        if (!isMounted) {
            // Return a stable format for server-side rendering (ISO UTC)
            return new Date(dateString).toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
        }
        // Return browser locale string after mount
        return new Date(dateString).toLocaleString();
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
        <Card className="rounded-3xl">
            <div className="w-full divide-y divide-gray-100">
                {logs.map((log, i) => (
                    <div key={i} className="p-2 md:p-4 flex flex-wrap md:grid md:grid-cols-4 items-center justify-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className="w-full flex justify-between">
                            <div className={`mt-1 px-2 py-1.5 md:py-2 md:px-3 flex rounded-full items-center justify-center md:col-span-1 ${getStyle(log.event_type)}`}>
                                {React.createElement(getIcon(log.event_type), { className: "flex-shrink-0 size-3.5" })}
                                <span className="text-xs md:text-sm ml-2">{formatText(log)}</span>
                            </div>
                            <Tag
                                text={formatDate(log.created_at)}
                                variant="ghost"
                                className="w-fit text-xs md:text-sm md:hidden"
                            />
                        </div>
                        <div className="flex flex-row gap-1 text-gray-700 items-center justify-center md:col-span-2">
                            {/* For bookmarks, show the ID if helpful, or specific logic */}
                            {(log.old_value || log.new_value) && (
                                <div className="flex flex-wrap gap-1 items-center justify-center">
                                    {log.old_value && (
                                        <>
                                            <Tag text={log.old_value} variant="outline" className="w-fit text-xs md:text-sm" />
                                            {log.new_value && <span className=" text-gray-400">→</span>}
                                        </>
                                    )}
                                    {log.new_value && (
                                        <Tag text={log.new_value} variant="outline" className="w-fit text-xs md:text-sm" />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="w-full hidden md:flex md:flex-col md:flex-row md:justify-end items-center gap-2 md:col-span-1">
                            <Tag
                                text={formatDate(log.created_at)}
                                variant="outline"
                                className="w-fit text-xs md:text-sm"
                            />
                            {log.ip_address && (
                                <Tag
                                    text={log.ip_address}
                                    variant="outline"
                                    className="w-fit text-xs md:text-sm"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card >
    );
}
