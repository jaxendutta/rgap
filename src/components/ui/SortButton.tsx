// src/components/ui/SortButton.tsx
import { LuMoveDown, LuMoveUp } from "react-icons/lu";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

export type SortDirection = "asc" | "desc";

interface SortButtonProps {
    label: string;
    icon: IconType;
    field: string;
    currentField: string;
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
            <span className={`text-xs md:text-sm whitespace-nowrap ${!isActive ? "hidden lg:flex" : "pl-1"}`}>{label}</span>
            {isActive && (
                <span className="text-gray-900">
                    {direction === "asc" ? (
                        <LuMoveUp className="size-3" />
                    ) : (
                        <LuMoveDown className="size-3" />
                    )}
                </span>
            )}
        </Button>
    );
};

export default SortButton;
