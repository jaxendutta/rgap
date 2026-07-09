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
    <Card className="p-2.5 md:p-4 flex flex-col flex-1">
        <div className="flex items-start mb-0.5 md:mb-2 gap-1.5 md:gap-2">
            <Icon className="size-7.5 sm:size-9 md:size-3.5 text-blue-600 -mt-0.5 md:mt-0.75" />
            <h3 className="font-medium text-gray-600 md:text-gray-800 text-[11px] md:text-sm">{title}</h3>
        </div>

        <div className="h-px bg-gray-200 mb-2 md:mb-1.5" />

        <div className="text-sm md:text-xl font-bold text-gray-900 flex flex-1 items-center text-center">{value}</div>
    </Card>
);