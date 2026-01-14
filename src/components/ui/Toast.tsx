"use client";

import { useEffect, ReactNode } from "react";
import { LuX, LuCircleCheck, LuCircleAlert, LuInfo } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
    id: string;
    message: ReactNode;
    type: ToastType;
    onClose: (id: string) => void;
}

const icons = {
    success: <LuCircleCheck className="w-5 h-5 text-green-600" />,
    error: <LuCircleAlert className="w-5 h-5 text-red-600" />,
    info: <LuInfo className="w-5 h-5 text-blue-600" />,
};

const styles = {
    success: "bg-green-50/90 border-green-200 text-green-900",
    error: "bg-red-50/90 border-red-200 text-red-900",
    info: "bg-blue-50/90 border-blue-200 text-blue-900",
};

export function Toast({ id, message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000); // Auto-close after 5s
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <motion.div
            layout // Smoothly animate layout changes when other toasts are removed
            initial={{ opacity: 0, y: -50, scale: 0.9 }} // Start above and slightly small
            animate={{ opacity: 1, y: 0, scale: 1 }} // Slide down to natural position
            exit={{ opacity: 0, y: -50, scale: 0.9 }} // Slide UP and shrink on exit
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
                "pointer-events-auto flex items-center gap-3 px-6 py-3 border shadow-xl backdrop-blur-md",
                "rounded-3xl", // <--- The requested shape
                styles[type]
            )}
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <div className="text-sm font-medium flex-1">{message}</div>
            <button
                onClick={() => onClose(id)}
                className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors text-current opacity-60 hover:opacity-100"
            >
                <LuX className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
