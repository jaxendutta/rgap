// src/components/common/ui/Tabs.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface TabItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    count?: number;
    disabled?: boolean;
}

interface TabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    variant?: "default" | "pills" | "underline";
    size?: "sm" | "md" | "lg";
    orientation?: "horizontal" | "vertical";
    fullWidth?: boolean;
    showCounts?: boolean;
    className?: string;
    tabClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onChange,
    variant = "default",
    size = "md",
    orientation = "horizontal",
    fullWidth = false,
    showCounts = false,
    className,
    tabClassName,
}) => {
    // Size-specific styles with vertical padding
    const sizeClasses = {
        sm: "text-sm py-2 px-2",
        md: "text-md py-3 px-3",
        lg: "text-base py-4 px-4",
    };

    // Variant-specific styles
    const getVariantClasses = (isActive: boolean) => {
        switch (variant) {
            case "pills":
                return isActive
                    ? "bg-blue-600 text-white rounded-md"
                    : "text-gray-600 hover:bg-gray-100 rounded-md";
            case "underline":
                return isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
            case "default":
            default:
                return isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";
        }
    };

    // Orientation-specific container classes
    const containerClasses =
        orientation === "vertical"
            ? "flex flex-col"
            : "flex flex-row items-center border-b border-gray-200";

    return (
        <div className={cn(containerClasses, className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => !tab.disabled && onChange(tab.id)}
                        disabled={tab.disabled}
                        className={cn(
                            "flex items-center font-medium transition-colors relative",
                            sizeClasses[size],
                            getVariantClasses(isActive),
                            fullWidth && "flex-1 justify-center",
                            tab.disabled && "opacity-50 cursor-not-allowed",
                            tabClassName
                        )}
                    >
                        {Icon && (
                            <Icon
                                className={cn(
                                    "h-4 w-4",
                                    !tab.label && "h-5 w-5",
                                    tab.label && "mr-2"
                                )}
                            />
                        )}
                        <span>{tab.label}</span>
                        {showCounts && tab.count !== undefined && (
                            <span
                                className={cn(
                                    "ml-2 rounded-full px-2 py-0.5 text-xs",
                                    isActive
                                        ? variant === "pills"
                                            ? "bg-white bg-opacity-20 text-white"
                                            : "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-600"
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default Tabs;
