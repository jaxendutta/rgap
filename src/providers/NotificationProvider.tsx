'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast, ToastType } from "@/components/ui/Toast";

interface NotificationContextType {
    notify: (message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const notify = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            {/* Toast Container - Fixed to bottom right */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end pointer-events-none">
                <div className="pointer-events-auto">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} onClose={removeToast} />
                    ))}
                </div>
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotify = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotify must be used within NotificationProvider");
    return context;
};
