'use client';

import { useEffect } from "react";
import { LuX, LuCircleCheck, LuCircleAlert, LuInfo } from "react-icons/lu";
import { cn } from "@/lib/utils"; // Assuming you have a standard cn utility, or use classNames

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    onClose: (id: string) => void;
}

const icons = {
    success: <LuCircleCheck className="w-5 h-5 text-green-600" />,
    error: <LuCircleAlert className="w-5 h-5 text-red-600" />,
    info: <LuInfo className="w-5 h-5 text-blue-600" />,
};

const styles = {
    success: "bg-green-50 border-green-200 text-green-900",
    error: "bg-red-50 border-red-200 text-red-900",
    info: "bg-blue-50 border-blue-200 text-blue-900",
};

export function Toast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000); // Auto-close after 5s
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div className={cn(
            "flex items-center gap-3 p-4 mb-3 rounded-lg border shadow-lg transition-all animate-in slide-in-from-right-full",
            styles[type]
        )}>
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="text-sm font-medium flex-1">{message}</p>
            <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600">
                <LuX className="w-4 h-4" />
            </button>
        </div>
    );
}
