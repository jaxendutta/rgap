// src/components/common/ui/StatCard.tsx
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: ReactNode;
    trend?: "up" | "down";
    className?: string;
    iconClassName?: string;
    labelClassName?: string;
    valueClassName?: string;
}

export const StatCard = ({
    icon: Icon,
    label,
    value,
    trend,
    className,
    iconClassName,
    labelClassName,
    valueClassName,
}: StatCardProps) => (
    <div
        className={cn(
            "bg-white p-3 lg:p-4 rounded-lg border border-gray-100 shadow-sm",
            className
        )}
    >
        <div
            className={cn(
                "flex items-center text-gray-600 text-sm mb-1",
                labelClassName
            )}
        >
            <Icon className={cn("h-3.5 w-3.5 mr-1.5", iconClassName)} />
            <span>{label}</span>
        </div>
        <div className={cn("flex items-center", valueClassName)}>
            <span className="text-lg lg:text-2xl font-bold text-gray-900">{value}</span>
            {trend === "up" && (
                <TrendingUp className="h-5 w-5 ml-2 text-green-500" />
            )}
            {trend === "down" && (
                <TrendingDown className="h-5 w-5 ml-2 text-red-500" />
            )}
        </div>
    </div>
);
