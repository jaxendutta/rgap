"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast, ToastType } from "@/components/ui/Toast";
import { AnimatePresence } from "framer-motion";

interface NotificationContextType {
    notify: (message: ReactNode, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Array<{ id: string; message: ReactNode; type: ToastType }>>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback((message: ReactNode, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}

            {/* Container: Fixed Top Center */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center w-full max-w-md pointer-events-none px-4 gap-2">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} onClose={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotify = () => {
    const context = useContext(NotificationContext);
    if (!context)
        throw new Error("useNotify must be used within NotificationProvider");
    return context;
};
