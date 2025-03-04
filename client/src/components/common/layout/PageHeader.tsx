// src/components/common/layout/PageHeader.tsx
import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { cn } from "@/utils/cn";

export interface PageAction {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "primary" | "outline" | "secondary";
    className?: string;
    disabled?: boolean;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    actions?: PageAction[];
    children?: React.ReactNode;
    className?: string;
    titleClassName?: string;
    subtitleClassName?: string;
    actionsClassName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    actions = [],
    children,
    className,
    titleClassName,
    subtitleClassName,
    actionsClassName,
}) => {
    return (
        <div
            className={cn(
                "flex flex-wrap items-start justify-between gap-4 mb-6",
                className
            )}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-6 w-6 text-gray-900" />}
                    <h1
                        className={cn(
                            "text-2xl font-semibold text-gray-900 truncate",
                            titleClassName
                        )}
                    >
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p
                        className={cn(
                            "mt-1 text-base text-gray-600",
                            subtitleClassName
                        )}
                    >
                        {subtitle}
                    </p>
                )}
                {children}
            </div>

            {actions.length > 0 && (
                <div
                    className={cn(
                        "flex flex-wrap items-center gap-3",
                        actionsClassName
                    )}
                >
                    {actions.map((action, index) => {
                        const ActionIcon = action.icon;
                        return (
                            <Button
                                key={index}
                                variant={action.variant || "outline"}
                                onClick={action.onClick}
                                className={action.className}
                                disabled={action.disabled}
                            >
                                {ActionIcon && (
                                    <ActionIcon className="h-4 w-4 mr-2" />
                                )}
                                {action.label}
                            </Button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
