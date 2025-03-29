// src/components/common/ui/SortButton.tsx
import { LucideIcon, MoveDown, MoveUp } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

export type SortDirection = "asc" | "desc";

interface SortButtonProps<T> {
    label: string;
    icon: LucideIcon;
    field: keyof T;
    currentField: keyof T;
    direction: SortDirection;
    onClick: () => void;
    className?: string;
}

export const SortButton = <T,>({
    label,
    icon: Icon,
    field,
    currentField,
    direction,
    onClick,
    className,
}: SortButtonProps<T>) => {
    const isActive = currentField === field;

    return (
        <Button
            variant="secondary"
            size="sm"
            leftIcon={Icon}
            onClick={onClick}
            className={cn(
                isActive
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900",
                className
            )}
        >
            <span className="hidden lg:flex">{label}</span>
            {isActive && (
                <span className="text-gray-900">
                    {direction === "asc" ? (
                        <MoveUp size={12} />
                    ) : (
                        <MoveDown size={12} />
                    )}
                </span>
            )}
        </Button>
    );
};
