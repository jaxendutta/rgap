// src/components/ui/SortButton.tsx
import { LuMoveDown, LuMoveUp } from "react-icons/lu";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

export type SortDirection = "asc" | "desc";

interface SortButtonProps {
    label: string;
    icon: IconType;
    field: string;        // Changed from keyof T to string
    currentField: string; // Changed from keyof T to string
    direction: SortDirection;
    onClick: () => void;
    className?: string;
}

export const SortButton = ({
    label,
    icon: Icon,
    field,
    currentField,
    direction,
    onClick,
    className,
}: SortButtonProps) => {
    const isActive = currentField === field;

    return (
        <Button
            variant="secondary"
            size="sm"
            leftIcon={Icon}
            onClick={onClick}
            className={cn(
                "gap-0.5 md:gap-1.5",
                isActive
                    ? "bg-gray-200 text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900 shadow-none",
                className
            )}
            aria-label={isActive ? `Sorted by ${label} in ${direction === "asc" ? "ascending" : "descending"} order` : `Sort by ${label}`}  
        >
            <span className={!isActive ? "hidden lg:flex" : "pl-1"}>{label}</span>
            {isActive && (
                <span className="text-gray-900">
                    {direction === "asc" ? (
                        <LuMoveUp size={12} />
                    ) : (
                        <LuMoveDown size={12} />
                    )}
                </span>
            )}
        </Button>
    );
};
