// src/components/common/ui/SearchField.tsx
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
        <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                className="w-full pl-10 pr-2.5 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
            />
        </div>
    );
};
