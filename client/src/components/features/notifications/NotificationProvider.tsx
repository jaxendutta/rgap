// src/components/features/notifications/NotificationProvider.tsx
import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, ArrowUpRight } from "lucide-react";
import { cn } from "@/utils/cn";
import { Card } from "@/components/common/ui/Card";
import Button from "@/components/common/ui/Button";

type NotificationType = "success" | "error" | "info";

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    action?: () => void;
}

interface NotificationContextType {
    showNotification: (
        message: string,
        type?: NotificationType,
        action?: () => void
    ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback(
        (
            message: string,
            type: NotificationType = "info",
            action?: () => void
        ) => {
            const id = Math.random().toString(36).substring(7);
            setNotifications((prev) => [
                ...prev,
                { id, type, message, action },
            ]);

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

    const handleNotificationClick = (id: string) => {
        const notification = notifications.find((n) => n.id === id);
        if (notification && notification.action) {
            notification.action();
            removeNotification(id);
        }
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

    const getCardColor = (type: NotificationType) => {
        switch (type) {
            case "success":
                return "border-green-200 bg-green-50";
            case "error":
                return "border-red-200 bg-red-50";
            default:
                return "border-blue-200 bg-blue-50";
        }
    };

    const getColor = (type: NotificationType) => {
        switch (type) {
            case "success":
                return "text-green-600";
            case "error":
                return "text-red-600";
            default:
                return "text-blue-600";
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-lg">
                <AnimatePresence>
                    {notifications.map(({ id, type, message, action }) => (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="pointer-events-auto mx-4 mb-4"
                        >
                            <Card
                                className={cn(
                                    "flex items-center justify-center shadow-lg rounded-full",
                                    getCardColor(type),
                                    action &&
                                        "cursor-pointer hover:shadow-md transition-all duration-200"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex flex-1 items-center text-sm p-3 gap-3",
                                        getColor(type),
                                        action && "hover:underline"
                                    )}
                                    onClick={() =>
                                        action && handleNotificationClick(id)
                                    }
                                >
                                    {getIcon(type)}
                                    <span className="flex items-center gap-1">
                                        {message}
                                        {action && (
                                            <ArrowUpRight className="h-4 w-4 flex-shrink-0 animate-pulse" />
                                        )}
                                    </span>
                                </div>
                                <Button
                                    variant={"ghost"}
                                    leftIcon={X}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(id);
                                    }}
                                    className={cn(
                                        "flex-shrink-0",
                                        getColor(type)
                                    )}
                                />
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
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
