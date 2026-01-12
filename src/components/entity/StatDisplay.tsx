// src/components/entity/StatDisplay.tsx
'use client';

import React from 'react';
import { IconType } from 'react-icons';

export interface StatItem {
    icon: IconType;
    label: string;
    value: string | number;
}

export interface StatDisplayProps {
    items: StatItem[];
    columns?: 2 | 3 | 4;
}

const StatDisplay: React.FC<StatDisplayProps> = ({
    items,
    columns = 4,
}) => {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4 p-6 pt-0`}>
            {items.map((item, index) => {
                const Icon = item.icon;
                return (
                    <div
                        key={index}
                        className="flex flex-col items-center p-3 bg-blue-100/60 rounded-lg"
                    >
                        <span className=" flex text-gray-700 rounded-lg text-xs items-center justify-center gap-1">
                            <Icon className="w-3 h-3" />
                            {item.label}
                        </span>
                        <div className="text-lg font-semibold text-gray-900">
                            {typeof item.value === 'number'
                                ? item.value.toLocaleString()
                                : item.value
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default StatDisplay;