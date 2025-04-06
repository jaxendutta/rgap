// src/components/common/layout/PageContainer.tsx
import React from "react";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className,
}) => {
    return (
        <div
            className={`max-w-7xl mx-auto p-1.5 lg:p-6 ${className}`}
        >
            {children}
        </div>
    );
};

export default PageContainer;
