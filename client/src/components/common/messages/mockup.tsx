import React from 'react';
import { AlertCircle } from 'lucide-react';

const MockupMessage: React.FC = () => {
    return (
        <div className="text-md text-red-600 bg-red-100 p-4 mb-2 flex rounded-md flex-col">
            {/* Header */}
            <div className="flex align-start items-center text-red-600 mb-2 space-x-1.5 font-semibold text-xl">
                {/* Icon */}
                <AlertCircle className="" />
                {/* Text */}
                <span>NOTE!</span>
            </div>

            {/* Body */}
            <div>
                <span>This feature is not yet in effect. Please check back later.</span>
            </div>
        </div>
    );
};

export default MockupMessage;