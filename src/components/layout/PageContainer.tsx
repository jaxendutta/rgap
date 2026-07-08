// src/components/layout/PageContainer.tsx
import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className,
}) => {
    // w-full is required here: as a flex item of <main> (flex flex-col), the
    // mx-auto centering margins disable cross-axis stretch, so without an
    // explicit width this collapses to its content's shrink-to-fit size
    // instead of filling out to max-w-7xl -- only "coincidentally" wide on
    // pages whose content happens to be wide on its own (e.g. a chart).
    return (
        <div className={cn("w-full max-w-7xl mx-auto py-3 px-0 md:p-7 lg:p-8", className)}>
            {children}
        </div>
    );
};

export default PageContainer;
