// src/components/ui/SearchField.tsx
import React from "react";

interface SearchFieldProps {
    icon: React.ComponentType<{ className?: string }>;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onEnter: () => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
    icon: Icon,
    placeholder,
    value,
    onChange,
    onEnter,
}) => {
    return (
        <div className="relative flex items-center">
            <Icon className="absolute left-3 md:left-4 text-gray-400 h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5" />
            <input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onEnter();
                    }
                }}
                className="w-full pl-8 md:pl-10 lg:pl-12 pr-4 py-2 bg-white text-xs md:text-sm lg:text-base shadow-xs rounded-full border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
        </div>
    );
};
