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
    return (<div className={`max-w-7xl mx-auto p-6 md:p-7 lg:p-8 ${className}`}>{children}</div>);
};

export default PageContainer;
