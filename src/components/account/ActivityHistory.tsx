'use client';

import React from 'react';
import { FiEdit2, FiLock, FiMail, FiLogIn, FiClock } from 'react-icons/fi';
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'PASSWORD_CHANGE': return FiLock;
            case 'EMAIL_CHANGE': return FiMail;
            case 'NAME_CHANGE': return FiEdit2;
            case 'LOGIN': return FiLogIn;
            default: return FiClock;
        }
    };

    const getStyle = (type: string) => {
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
            default: return log.event_type.replace('_', ' ').toLowerCase();
        }
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
                    <div key={i} className="p-2 md:p-4 flex flex-wrap md:grid md:grid-cols-3 items-center justify-center gap-4 hover:bg-gray-50/50 transition-colors">
                        <div className={`mt-1 p-2 flex w-full rounded-full items-center justify-center ${getStyle(log.event_type)}`}>
                            {React.createElement(getIcon(log.event_type), { className: "flex-shrink-0 size-3.5" })}
                            <span className="text-sm ml-2">{formatText(log)}</span>
                        </div>
                        <div className="flex flex-row gap-1 text-gray-700 items-center justify-center">
                            {log.old_value && log.new_value && (
                                <>
                                    <Tag text={log.old_value} variant="outline" className="w-fit" />
                                    <span className=" text-gray-400">→</span>
                                    <Tag text={log.new_value} variant="outline" className="w-fit" />
                                </>
                            )}
                        </div>
                        <div className="w-full flex flex-col md:flex-row md:justify-end items-center gap-2">
                            <Tag
                                text={new Date(log.created_at).toLocaleString()}
                                variant="outline"
                                className="w-fit"
                            />
                            {log.ip_address && (
                                <Tag
                                    text={log.ip_address}
                                    variant="outline"
                                    className="w-fit"
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card >
    );
}
