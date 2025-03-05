// src/components/common/ui/Tag.tsx
import React from "react";
import { LucideIcon, X } from "lucide-react";
import { cn } from "@/utils/cn";

export type TagSize = "xs" | "sm" | "md" | "lg";
export type TagVariant =
    | "default" // Gray background, standard tag
    | "primary" // Blue accent
    | "secondary" // Darker shade
    | "success" // Green for success states
    | "warning" // Yellow/orange for warnings
    | "danger" // Red for errors/danger
    | "outline" // Bordered version
    | "ghost"; // Minimal background

export interface TagProps {
    /** The text content of the tag */
    children: React.ReactNode;

    /** Icon to show before the text */
    icon?: LucideIcon;

    /** Tag appearance variant */
    variant?: TagVariant;

    /** Tag size */
    size?: TagSize;

    /** Function to call when the remove button is clicked */
    onRemove?: () => void;

    /** Controls if the tag is rounded as pill (fully rounded) or slightly rounded */
    pill?: boolean;

    /** Additional CSS classes */
    className?: string;

    /** Props for icon customization */
    iconProps?: React.SVGProps<SVGSVGElement>;

    /** Optional click handler */
    onClick?: () => void;
}

export const Tag: React.FC<TagProps> = ({
    children,
    icon: Icon,
    variant = "default",
    size = "md",
    onRemove,
    pill = false,
    className,
    iconProps,
    onClick,
}) => {
    // Define variant styles
    const variants = {
        default:
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
        primary:
            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
        secondary:
            "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100",
        success:
            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
        warning:
            "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
        danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
        outline:
            "bg-transparent border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
    };

    // Define size styles
    const sizes = {
        xs: "px-1.5 py-0.5 text-xs",
        sm: "px-2 py-1 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
    };

    // Define icon sizes
    const iconSizes = {
        xs: "h-2.5 w-2.5",
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
    };

    // Spacing between icon and text
    const iconSpacing = {
        xs: "mr-1",
        sm: "mr-1.5",
        md: "mr-1.5",
        lg: "mr-2",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium gap-1",
                variants[variant],
                sizes[size],
                pill ? "rounded-full" : "rounded-md",
                onClick && "cursor-pointer hover:opacity-90 active:opacity-80",
                className
            )}
            onClick={onClick}
        >
            {Icon && (
                <Icon
                    className={cn(
                        iconSizes[size],
                        onRemove ? "" : iconSpacing[size]
                    )}
                    {...iconProps}
                />
            )}

            <span
                className={cn(
                    "truncate max-w-[180px]",
                    size === "xs" && "max-w-[100px]"
                )}
            >
                {children}
            </span>

            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    className={cn(
                        "ml-1 text-current opacity-60 hover:opacity-100 focus:outline-none",
                        size === "xs" || size === "sm" ? "p-0.5" : "p-1",
                        "rounded-full hover:bg-gray-200/30 dark:hover:bg-gray-600/30"
                    )}
                >
                    <X
                        className={
                            iconSizes[
                                size === "lg"
                                    ? "sm"
                                    : size === "md"
                                    ? "xs"
                                    : "xs"
                            ]
                        }
                    />
                </button>
            )}
        </span>
    );
};

// TagGroup component for grouping tags
export interface TagGroupProps {
    children: React.ReactNode;
    className?: string;
    spacing?: "tight" | "normal" | "loose";
}

export const TagGroup: React.FC<TagGroupProps> = ({
    children,
    className,
    spacing = "normal",
}) => {
    const spacingClasses = {
        tight: "gap-1",
        normal: "gap-2",
        loose: "gap-3",
    };

    return (
        <div
            className={cn("flex flex-wrap", spacingClasses[spacing], className)}
        >
            {children}
        </div>
    );
};

export default Tag;
