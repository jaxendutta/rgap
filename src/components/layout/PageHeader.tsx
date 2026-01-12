// src/components/layout/PageHeader.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
    icon?: IconType;
    action?: React.ReactNode;
    breadcrumbs?: React.ReactNode;
    className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    action,
    breadcrumbs,
    className,
}) => {
    return (
        <div className={cn("mb-4 md:mb-6", className)}>
            {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <span className="text-lg md:text-2xl lg:text-3xl font-semibold text-gray-900">
                        [ {title} ]
                    </span>
                    {subtitle && (
                        <p className="text-sm md:text-base mt-1 text-gray-600">{subtitle}</p>
                    )}
                </div>

                {action && <div className="sm:ml-auto">{action}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
