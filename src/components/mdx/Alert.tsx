import { LuInfo, LuTriangleAlert, LuLightbulb, LuFlame } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { PiWarningOctagon, PiWarningOctagonLight } from "react-icons/pi";

type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

interface AlertProps {
    type?: AlertType;
    title?: string;
    children: React.ReactNode;
}

const configs = {
    note: {
        icon: LuInfo,
        color: "text-blue-600",
        border: "border-blue-200",
        bg: "bg-blue-50",
        label: "Note"
    },
    tip: {
        icon: LuLightbulb,
        color: "text-green-600",
        border: "border-green-200",
        bg: "bg-green-50",
        label: "Tip"
    },
    important: {
        icon: LuInfo,
        color: "text-purple-600",
        border: "border-purple-200",
        bg: "bg-purple-50",
        label: "Important"
    },
    warning: {
        icon: LuTriangleAlert,
        color: "text-amber-600",
        border: "border-amber-200",
        bg: "bg-amber-50",
        label: "Warning"
    },
    caution: {
        icon: PiWarningOctagon,
        color: "text-red-600",
        border: "border-red-200",
        bg: "bg-red-50",
        label: "Caution"
    }
};

export function Alert({ type = 'note', title, children }: AlertProps) {
    const config = configs[type];
    const Icon = config.icon;

    return (
        <div className={cn("mt-2 md:mt-6 border-l-4 p-4", config.bg, config.border)}>
            <div className="flex items-center gap-1 md:gap-2 mb-2">
                <Icon className={cn("size-3.5 md:size-4", config.color)} />
                <span className={cn("text-sm font-semibold", config.color)}>
                    {title || config.label}
                </span>
            </div>
            <div className="text-gray-700 text-sm leading-6 -mb-2">
                {children}
            </div>
        </div>
    );
}
