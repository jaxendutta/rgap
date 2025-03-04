// src/components/common/ui/EntityHeader.tsx
import React from "react";
import { LucideIcon, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

export interface MetadataItem {
    icon: LucideIcon;
    text: string;
    href?: string;
}

export interface ActionButton {
    icon: LucideIcon;
    label?: string;
    onClick: () => void;
    active?: boolean;
    variant?: "primary" | "secondary" | "outline";
}

interface EntityHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    metadata?: MetadataItem[];
    actions?: ActionButton[];
    isBookmarked?: boolean;
    onToggleBookmark?: () => void;
    className?: string;
}

const EntityHeader: React.FC<EntityHeaderProps> = ({
    title,
    subtitle,
    icon: IconComponent,
    metadata = [],
    actions = [],
    isBookmarked,
    onToggleBookmark,
    className,
}) => {
    // Process bookmark if provided
    const allActions = [...actions];
    if (typeof isBookmarked !== "undefined" && onToggleBookmark) {
        allActions.push({
            icon: isBookmarked ? BookmarkCheck : BookmarkPlus,
            onClick: onToggleBookmark,
            active: isBookmarked,
        });
    }

    return (
        <div
            className={cn(
                "p-4 lg:p-6 pb-4 border-b border-gray-100",
                className
            )}
        >
            <div className="flex flex-wrap justify-between">
                <div className="space-y-2 max-w-full lg:max-w-3xl">
                    <div className="flex flex-col lg:flex-row items-start gap-3">
                        <div className="flex flex-row items-start justify-between w-full lg:w-auto">
                            {IconComponent && (
                                <IconComponent className="h-6 w-6 text-blue-600 mt-1 shrink-0" />
                            )}
                            <div className="lg:hidden flex items-start gap-1">
                                {/* Mobile actions */}
                                {allActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        onClick={action.onClick}
                                        variant={action.variant || "secondary"}
                                        className={cn(
                                            "p-1 transition-colors hover:bg-gray-50",
                                            action.active
                                                ? "text-blue-600 hover:text-blue-700"
                                                : "text-gray-400 hover:text-gray-600"
                                        )}
                                        aria-label={action.label || "Action"}
                                    >
                                        {React.createElement(action.icon, {
                                            className: "h-6 w-6",
                                        })}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-gray-600">{subtitle}</p>
                            )}
                            <div className="flex flex-wrap items-center text-gray-600 mt-1 gap-x-4 gap-y-1">
                                {metadata.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1.5"
                                    >
                                        {React.createElement(item.icon, {
                                            className: "h-4 w-4 flex-shrink-0",
                                        })}
                                        <span>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="hover:text-blue-600 transition-colors"
                                                >
                                                    {item.text}
                                                </a>
                                            ) : (
                                                item.text
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hidden lg:flex flex-row items-start gap-3 mt-4 lg:mt-0">
                    {/* Desktop actions */}
                    {allActions.map((action, index) => (
                        <Button
                            key={index}
                            onClick={action.onClick}
                            variant={action.variant || "secondary"}
                            className={cn(
                                "p-1 transition-colors hover:bg-gray-50",
                                action.active
                                    ? "text-blue-600 hover:text-blue-700"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                            aria-label={action.label || "Action"}
                        >
                            {React.createElement(action.icon, {
                                className: "h-6 w-6",
                            })}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EntityHeader;
