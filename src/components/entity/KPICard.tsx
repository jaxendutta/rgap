"use client";

import { Card } from "@/components/ui/Card";
import { IconType } from "react-icons";

export const KPICard = ({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: React.ReactNode;
    icon: IconType;
}) => (
    <Card className="p-2.5 md:p-4 flex flex-col flex-1 relative overflow-hidden">
        {/* Static background watermark icon */}
        {Icon && (
            <div className="absolute -right-3 -bottom-3 text-blue-900/10 pointer-events-none z-0">
                <Icon className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" />
            </div>
        )}

        <div className="flex items-center justify-center mb-0.5 md:mb-2 text-center relative z-10">
            <h3 className="font-medium text-gray-600 md:text-gray-800 text-[11px] md:text-sm text-center">{title}</h3>
        </div>

        <div className="h-px bg-gray-200 mb-2 md:mb-1.5 relative z-10" />

        <div className="text-sm md:text-xl font-bold text-gray-900 flex flex-col flex-1 items-center justify-center text-center relative z-10 w-full">{value}</div>
    </Card>
);