// src/components/features/notifications/NotificationProvider.tsx
import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type NotificationType = "success" | "error" | "info";

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback(
        (message: string, type: NotificationType = "info") => {
            const id = Math.random().toString(36).substring(7);
            setNotifications((prev) => [...prev, { id, type, message }]);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, 5000);
        },
        []
    );

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-5 w-5" />;
            case "error":
                return <AlertCircle className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getColors = (type: NotificationType) => {
        switch (type) {
            case "success":
                return "bg-green-50 border-green-200 text-green-800";
            case "error":
                return "bg-red-50 border-red-200 text-red-800";
            default:
                return "bg-blue-50 border-blue-200 text-blue-800";
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-lg">
                <div>
                    <AnimatePresence>
                        {notifications.map(({ id, type, message }) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                className="pointer-events-auto mx-4 mb-4"
                            >
                                <div
                                    className={`flex items-start p-4 rounded-lg border shadow-lg ${getColors(
                                        type
                                    )}`}
                                >
                                    <div className="flex-shrink-0 mr-3">
                                        {getIcon(type)}
                                    </div>
                                    <div className="flex-1 text-sm py-0.5">
                                        {message}
                                    </div>
                                    <button
                                        onClick={() => removeNotification(id)}
                                        className="flex-shrink-0 ml-4 flex items-center justify-center h-5 w-5 rounded-full hover:bg-black/5 transition-colors"
                                    >
                                        <X className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error(
            "useNotification must be used within a NotificationProvider"
        );
    }
    return context;
};

export default NotificationProvider;
