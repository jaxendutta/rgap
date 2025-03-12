// src/components/common/layout/PageHeader.tsx
import React from "react";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
    title: string;
    subtitle?: React.ReactNode;
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
        <div className={cn("mb-6", className)}>
            {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-gray-600">{subtitle}</p>
                    )}
                </div>

                {action && <div className="sm:ml-auto">{action}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
