// src/components/common/ui/TabNavigation.tsx
import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";

export interface Tab {
    id: string;
    label: string;
    icon?: LucideIcon;
}

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export const TabNavigation = ({
    tabs,
    activeTab,
    onTabChange,
    className,
}: TabNavigationProps) => {
    return (
        <div className={cn("border-b border-gray-200", className)}>
            <div className="flex -mb-px overflow-x-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center justify-center px-4 py-3 text-sm font-medium whitespace-nowrap w-full",
                                "border-b-2 transition-colors duration-200 ease-in-out",
                                activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            {Icon && <Icon className="h-4 w-4 mr-2" />}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
