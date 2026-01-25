// src/components/ui/Tag.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { LuArrowRight, LuX } from "react-icons/lu";

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
const padding = {
    xs: "px-2 py-0.75",
    sm: "px-3 py-1",
    md: "px-3.5 py-1",
    lg: "px-4 py-1.5",
};

// Define font size styles
const fontSizes = {
    xs: "text-[10px] md:text-xs",
    sm: "text-xs md:text-sm",
    md: "text-sm md:text-base",
    lg: "text-base",
};

// Define icon sizes
const iconSizes = {
    xs: "size-2.5",
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
};

// Spacing between icon and text
const iconSpacing = {
    xs: "mr-0.5 mb-0.25",
    sm: "mr-0.5",
    md: "mr-1",
    lg: "mr-1",
};

export interface TagProps {
    text: string;
    innerText?: string;
    icon?: IconType;
    variant?: keyof typeof variants;
    size?: keyof typeof padding;
    onRemove?: () => void;
    pill?: boolean;
    className?: string;
    iconProps?: React.SVGProps<SVGSVGElement>;
    onClick?: () => void;
}

export const Tag: React.FC<TagProps> = ({
    text,
    innerText,
    icon: Icon,
    variant = "default",
    size = "md",
    onRemove,
    pill = true,
    className,
    iconProps,
    onClick,
}) => {
    return (
        <span
            className={cn(
                "flex items-center font-medium gap-1 max-w-full group",
                variants[variant],
                fontSizes[size],
                pill ? "rounded-full" : "rounded-md",
                onClick && "cursor-pointer hover:opacity-90 active:opacity-80",
                className
            )}
            onClick={onClick}
        >
            <div className={`flex flex-row gap-0.75 md:gap-1 items-center justify-center ${padding[size]} ${!innerText ? "flex-1" : ""} ${innerText || onClick ? "pr-0" : ""}`}>
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
                {text}
            </div>
            {innerText && <span className={`flex-1 bg-white w-full m-1 px-1.75 py-1 rounded-3xl 
                ${variant === 'outline' ? 'border border-gray-300' : ''}`}>
                {innerText}
            </span>}
            {onClick && (
                <LuArrowRight
                    className={cn(
                        iconSizes[size],
                        "flex text-blue-400 flex-shrink-0 transition-transform duration-300 ease-in-out",
                        "group-hover:text-blue-600 mr-1"
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
                    <LuX
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

const spacingClasses = {
    tightest: "gap-1",
    tight: "gap-1.5",
    normal: "gap-2",
    wide: "gap-2.5",
    widest: "gap-3"
};

// TagGroup component for grouping tags
export interface TagsProps {
    children: React.ReactNode;
    className?: string;
    spacing?: keyof typeof spacingClasses;
}

export const Tags: React.FC<TagsProps> = ({
    children,
    className,
    spacing = "normal",
}) => {
    return (
        <div
            className={cn("flex flex-wrap", spacingClasses[spacing], className)}
        >
            {children}
        </div>
    );
};

export default Tag;
