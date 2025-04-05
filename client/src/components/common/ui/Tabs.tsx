// src/components/common/ui/Tabs.tsx
import React, { useRef, useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

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
    // Refs for each tab button to measure positions
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // State to track the position and dimensions of the active pill background
    const [pillStyle, setPillStyle] = useState({
        left: 0,
        width: 0,
        height: 0,
        top: 0,
    });

    // Track if the component has mounted to prevent initial animation
    const [hasMounted, setHasMounted] = useState(false);

    // Size-specific styles with vertical padding
    const sizeClasses = {
        sm: "text-sm py-1.5 px-3",
        md: "text-md py-1.5 px-4",
        lg: "text-base py-2 px-5",
    };

    // Variant-specific styles
    const getVariantClasses = (isActive: boolean) => {
        switch (variant) {
            case "pills":
                return isActive
                    ? "text-white relative z-10" // Text is white, but the background is handled by the sliding pill
                    : "text-gray-600 hover:text-gray-900 relative z-10"; // Just the text color changes on hover
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

    // Update pill position based on the active tab
    useEffect(() => {
        if (variant !== "pills" || !tabRefs.current.length) return;

        const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
        if (activeIndex === -1) return;

        const activeTabElement = tabRefs.current[activeIndex];
        if (!activeTabElement) return;

        const rect = activeTabElement.getBoundingClientRect();
        const parentRect =
            activeTabElement.parentElement?.getBoundingClientRect();

        if (parentRect) {
            setPillStyle({
                left:
                    orientation === "horizontal"
                        ? activeTabElement.offsetLeft
                        : 0,
                top:
                    orientation === "vertical" ? activeTabElement.offsetTop : 0,
                width:
                    orientation === "horizontal"
                        ? rect.width
                        : parentRect.width,
                height:
                    orientation === "vertical"
                        ? rect.height
                        : parentRect.height,
            });
        }

        // Mark as mounted after first position calculation
        if (!hasMounted) {
            setHasMounted(true);
        }
    }, [activeTab, tabs, variant, orientation, hasMounted]);

    // Reset references when tabs change
    useEffect(() => {
        tabRefs.current = tabRefs.current.slice(0, tabs.length);
    }, [tabs]);

    // Orientation-specific container classes with special handling for pills variant
    const containerClasses = cn(
        orientation === "vertical"
            ? "flex flex-col"
            : "flex flex-row items-center",
        variant !== "pills" && "border-b border-gray-200",
        variant === "pills" && "bg-gray-200 p-1 rounded-full relative",
    );

    return (
        <div className={cn(containerClasses, className)}>
            {/* Sliding background pill */}
            {variant === "pills" && (
                <motion.div
                    className="absolute bg-gray-800 rounded-full z-0"
                    initial={false}
                    animate={{
                        left: pillStyle.left,
                        top: pillStyle.top,
                        width: pillStyle.width,
                        height: pillStyle.height,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        duration: 0.3,
                    }}
                    style={{
                        position: "absolute",
                    }}
                />
            )}

            {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        ref={(el) => {
                            tabRefs.current[index] = el;
                        }}
                        onClick={() => !tab.disabled && onChange(tab.id)}
                        disabled={tab.disabled}
                        className={cn(
                            "flex items-center justify-center font-medium transition-colors relative",
                            sizeClasses[size],
                            getVariantClasses(isActive),
                            fullWidth && "flex-1",
                            tab.disabled && "opacity-50 cursor-not-allowed",
                            variant === "pills" && "rounded-full",
                            tabClassName,
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
