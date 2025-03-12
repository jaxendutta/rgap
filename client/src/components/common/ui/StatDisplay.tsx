// src/components/common/ui/StatDisplay.tsx
import React from "react";
import {
    LucideIcon,
    TrendingUp,
    TrendingDown,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface StatItem {
    icon?: LucideIcon;
    label: string;
    value: React.ReactNode;
    trend?: "up" | "down";
    secondaryText?: string;
}

interface StatDisplayProps {
    items: StatItem[];
    layout?: "grid" | "row" | "column";
    columns?: 1 | 2 | 3 | 4;
    size?: "sm" | "md" | "lg";
    className?: string;
    cardClassName?: string;
    expandable?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
}

const StatDisplay: React.FC<StatDisplayProps> = ({
    items,
    layout = "grid",
    columns = 3,
    size = "md",
    className,
    cardClassName,
    expandable = false,
    expanded = false,
    onToggleExpand,
}) => {
    // Generate layout-specific class names
    const getLayoutClasses = () => {
        switch (layout) {
            case "row":
                return "flex flex-row flex-wrap gap-4";
            case "column":
                return "flex flex-col gap-4";
            case "grid":
            default:
                const colClasses = {
                    1: "grid-cols-1",
                    2: "grid-cols-1 md:grid-cols-2",
                    3: "grid-cols-1 md:grid-cols-3",
                    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
                };
                return `grid ${colClasses[columns]} gap-4`;
        }
    };

    // Generate size-specific classes
    const getSizeClasses = () => {
        switch (size) {
            case "sm":
                return {
                    card: "p-2",
                    icon: "h-3.5 w-3.5 mr-1.5",
                    label: "text-xs",
                    value: "text-lg font-semibold",
                };
            case "lg":
                return {
                    card: "p-4",
                    icon: "h-5 w-5 mr-2",
                    label: "text-md",
                    value: "text-3xl font-bold",
                };
            case "md":
            default:
                return {
                    card: "p-3",
                    icon: "h-4 w-4 mr-1.5",
                    label: "text-sm",
                    value: "text-2xl font-semibold",
                };
        }
    };

    const sizeClasses = getSizeClasses();

    // If expandable, only show the first 'columns' items unless expanded
    const visibleItems =
        expandable && !expanded ? items.slice(0, columns) : items;

    return (
        <div className="px-3 lg:px-6 pt-3 lg:pt-6 pb-2 bg-gray-50 rounded-b-lg">
            <div className={className}>
                <div className={cn(getLayoutClasses())}>
                    {visibleItems.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                "bg-white rounded-lg border border-gray-100 shadow-sm",
                                sizeClasses.card,
                                cardClassName
                            )}
                        >
                            <div
                                className={`flex items-center text-gray-600 mb-1 ${sizeClasses.label}`}
                            >
                                {item.icon &&
                                    React.createElement(item.icon, {
                                        className: sizeClasses.icon,
                                    })}
                                <span>{item.label}</span>
                            </div>
                            <div className="flex items-center">
                                <span className={sizeClasses.value}>
                                    {item.value}
                                </span>
                                {item.trend === "up" && (
                                    <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
                                )}
                                {item.trend === "down" && (
                                    <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
                                )}
                            </div>
                            {item.secondaryText && (
                                <div className="text-xs text-gray-500 mt-1">
                                    {item.secondaryText}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {expandable && items.length > columns && (
                    <button
                        onClick={onToggleExpand}
                        className="w-full flex items-center justify-center mt-3 text-sm text-gray-500 hover:text-gray-700 group"
                    >
                        <span className="flex items-center gap-1">
                            {expanded
                                ? "Show Less"
                                : `Show ${items.length - columns} More`}
                            {expanded ? (
                                <ChevronUp className="h-4 w-4 ml-1" />
                            ) : (
                                <ChevronDown className="h-4 w-4 ml-1" />
                            )}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatDisplay;
