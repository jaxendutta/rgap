// src/components/common/layout/PageContainer.tsx
import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
    return (
        <div className="max-w-7xl mx-auto p-2 lg:p-6 space-y-6">
            {children}
        </div>
    );
};

export default PageContainer;