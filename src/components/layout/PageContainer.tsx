// src/components/layout/PageContainer.tsx
import React from "react";

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
    children,
    className,
}) => {
    return (<div className={`max-w-7xl mx-auto py-3 px-0 md:p-7 lg:p-8 ${className}`}>{children}</div>);
};

export default PageContainer;
