import React from "react";
import {
    LucideIcon,
    TrendingUp,
    TrendingDown,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";

export interface StatItem {
    icon?: LucideIcon;
    label: string;
    value: React.ReactNode;
    trend?: "up" | "down" | "neutral";
    secondaryText?: string;
}

interface StatDisplayProps {
    items: StatItem[];
    expandableItems?: StatItem[];
    layout?: "grid" | "row" | "column";
    columns?: 1 | 2 | 3 | 4;
    size?: "sm" | "md" | "lg";
    className?: string;
    cardClassName?: string;
    expandable?: boolean;
    expanded?: boolean;
    onToggleExpand?: () => void;
    roundedBottom?: boolean;
}

const StatDisplay: React.FC<StatDisplayProps> = ({
    items,
    expandableItems = [],
    layout = "grid",
    columns = 3,
    size = "md",
    className,
    cardClassName,
    expandable = false,
    expanded = false,
    onToggleExpand,
    roundedBottom = true,
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
                    4: "grid-cols-2 md:grid-cols-4",
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
                    value: "text-lg lg:text-2xl font-semibold",
                };
        }
    };

    const sizeClasses = getSizeClasses();

    // Render a stat item
    const renderStatItem = (item: StatItem, index: number) => (
        <div
            key={index}
            className={cn(
                "bg-white rounded-xl border border-gray-100 shadow-sm",
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
                <span
                    className={cn(
                        sizeClasses.value,
                        item.trend === "up"
                            ? "text-green-600"
                            : item.trend === "down"
                            ? "text-red-600"
                            : ""
                    )}
                >
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
    );

    return (
        <div className="group-hover:bg-gray-50">
            <div
                className={cn(
                    "bg-slate-100 px-3 lg:px-6 py-3 lg:py-6 transition-colors duration-200",
                    roundedBottom && "rounded-b-xl",
                    className
                )}
            >
                {/* Primary Stats */}
                <div className={cn(getLayoutClasses())}>
                    {items.map(renderStatItem)}
                </div>

                {/* Expandable Content */}
                {expandable && expandableItems.length > 0 && (
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className={cn(getLayoutClasses(), "mt-4")}
                            >
                                {expandableItems.map(renderStatItem)}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Toggle Button */}
            {expandable && (expandableItems.length > 0 || expanded) && (
                <button
                    onClick={onToggleExpand}
                    className="w-full flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 bg-white rounded-xl py-2 transition-colors group-hover:bg-gray-50"
                >
                    <span className="flex items-center gap-1 font-medium">
                        {expanded ? "Show Less" : "Show More"}
                        {expanded ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                    </span>
                </button>
            )}
        </div>
    );
};

export default StatDisplay;
