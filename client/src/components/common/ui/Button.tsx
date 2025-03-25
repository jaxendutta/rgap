// src/components/common/ui/Button.tsx
import { cn } from "@/utils/cn";
import { LucideIcon } from "lucide-react";
import { responsive } from "@/utils/responsive";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "destructive";
    size?: "sm" | "md" | "lg";
    leftIcon?: LucideIcon;
    rightIcon?: LucideIcon;
    iconPosition?: "left" | "right";
    isLoading?: boolean;
    responsiveText?: boolean; // New prop to enable responsive text
    responsiveIcon?: "hideOnMobile" | "hideOnDesktop" | "always"; // Control icon visibility
}

export const Button = ({
    children,
    className,
    variant = "primary",
    size = "md",
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    isLoading,
    disabled,
    responsiveText = false, // Default is false to maintain backward compatibility
    responsiveIcon = "always", // Default always shows icon
    ...props
}: ButtonProps) => {
    const variants = {
        primary: "bg-gray-900 text-white hover:bg-gray-800",
        secondary:
            "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
        outline:
            "bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50",
        destructive: "bg-red-600 text-white hover:bg-red-700", // added destructive variant
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-1.5 text-md",
        lg: "px-6 py-3 text-lg",
    };

    // Handle responsive icon visibility
    const iconClasses = {
        hideOnMobile: responsive.hiddenOnMobile,
        hideOnDesktop: responsive.hiddenOnDesktop,
        always: "",
    };

    return (
        <button
            className={cn(
                "flex items-center justify-center font-medium rounded-md gap-2",
                "transition-colors transition-all duration-800 ease-in-out",
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
                        <span className={cn("", iconClasses[responsiveIcon])}>
                            <LeftIcon className="w-4 h-4" />
                        </span>
                    )}

                    {responsiveText ? (
                        <>
                            <span className={responsive.visibleOnlyOnMobile}>
                                {/* Short text for mobile */}
                                {typeof children === "string" &&
                                    children.split(" ")[0]}
                            </span>
                            <span className={responsive.hiddenOnMobile}>
                                {/* Full text for larger screens */}
                                {children}
                            </span>
                        </>
                    ) : (
                        children
                    )}

                    {RightIcon && (
                        <span className={cn("", iconClasses[responsiveIcon])}>
                            <RightIcon className="w-4 h-4" />
                        </span>
                    )}
                </>
            )}
        </button>
    );
};
