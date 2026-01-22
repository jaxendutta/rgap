// src/components/ui/Button.tsx
"use client";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/responsive";
import { IconType } from "react-icons";

export const variants = {
    primary: "bg-gray-900 text-white hover:bg-black",
    secondary:
        "bg-gray-100 text-gray-700 hover:bg-gray-200",
    outline:
        "bg-transparent text-gray-700 border border-gray-300 hover:bg-shadow-sm",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-3 py-2.5 text-sm",
    lg: "px-6 py-3 text-md",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
    size?: keyof typeof sizes;
    leftIcon?: IconType | React.ComponentType<{ className?: string | undefined; }>;
    rightIcon?: IconType | React.ComponentType<{ className?: string | undefined; }>;
    isLoading?: boolean;
    pill?: boolean;
    responsiveText?: "hideOnMobile" | "hideOnDesktop" | "always" | "firstWord";
    responsiveIcon?: "hideOnMobile" | "hideOnDesktop" | "always";
}

export const Button = ({
    children,
    className,
    variant = "primary",
    size = "md",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    isLoading,
    pill = true,
    disabled,
    responsiveText = "always",
    responsiveIcon = "always",
    ...props
}: ButtonProps) => {
    // Handle responsive icon visibility
    const isMobile = useIsMobile();
    const iconClasses = {
        hideOnMobile: isMobile ? "hidden" : "",
        hideOnDesktop: isMobile ? "" : "hidden",
        always: "",
    };

    return (
        <button
            className={cn(
                "flex items-center justify-center font-medium gap-2 cursor-pointer shadow-xs",
                "transition-colors duration-300 ease-in-out",
                pill ? "rounded-full" : "rounded-md",
                variants[variant],
                sizes[size],
                (disabled || isLoading) && "opacity-50 cursor-not-allowed",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {LeftIcon && (
                        <span className={cn(iconClasses[responsiveIcon])}>
                            <LeftIcon className={`w-4 h-4 flex-shrink-0`} />
                        </span>
                    )}

                    {responsiveText === "firstWord" ? (
                        <>
                            <span className={isMobile ? "" : "hidden"}>
                                {/* Short text for mobile */}
                                {typeof children === "string" &&
                                    children.split(" ")[0]}
                            </span>
                            <span className={isMobile ? "hidden" : ""}>
                                {/* Full text for larger screens */}
                                {children}
                            </span>
                        </>
                    ) : responsiveText === "hideOnMobile" ? (
                        <span className={isMobile ? "hidden" : ""}>
                            {children}
                        </span>
                    ) : responsiveText === "hideOnDesktop" ? (
                        <span className={isMobile ? "" : "hidden"}>
                            {children}
                        </span>
                    ) : (
                        children
                    )}

                    {RightIcon && (
                        <span className={cn(iconClasses[responsiveIcon])}>
                            <RightIcon className="w-4 h-4 flex-shrink-0" />
                        </span>
                    )}
                </>
            )}
        </button>
    );
};

export default Button;
