// src/components/common/ui/Tag.tsx
import React from "react";
import { ArrowUpRight, LucideIcon, X } from "lucide-react";
import { cn } from "@/utils/cn";

// Define variant styles
const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-blue-100 text-blue-700",
    secondary: "bg-gray-200 text-gray-800",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    outline: "bg-transparent border border-gray-300 text-gray-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    link: "text-blue-700 bg-blue-100 hover:opacity-90 hover:text-blue-600",
};

// Define size styles
const sizes = {
    xs: "px-2 py-0.5 text-xs",
    sm: "px-3 py-1 text-xs",
    md: "px-3.5 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
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
    xs: "mr-0.5",
    sm: "mr-0.5",
    md: "mr-1",
    lg: "mr-1",
};

export interface TagProps {
    /** The text content of the tag */
    children: React.ReactNode;

    /** Icon to show before the text */
    icon?: LucideIcon;

    /** Tag appearance variant */
    variant?: keyof typeof variants;

    /** Tag size */
    size?: keyof typeof sizes;

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
    return (
        <span
            className={cn(
                "flex items-center font-medium gap-1 max-w-full group",
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
                        onRemove ? "" : iconSpacing[size],
                        "flex-shrink-0"
                    )}
                    {...iconProps}
                />
            )}

            <span className="truncate flex-1">{children}</span>
            {onClick && (
                <ArrowUpRight
                    className={cn(
                        iconSizes[size],
                        "flex-shrink-0 transition-transform duration-200",
                        "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    )}
                />
            )}

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
                        "rounded-full hover:bg-gray-200/30"
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
export interface TagsProps {
    children: React.ReactNode;
    className?: string;
    spacing?: "tight" | "normal" | "loose";
}

export const Tags: React.FC<TagsProps> = ({
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
