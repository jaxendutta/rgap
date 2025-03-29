// src/components/common/ui/ToggleButton.tsx
import React, { ReactElement } from "react";
import { cn } from "@/utils/cn";
import { ButtonProps, Button } from "./Button";

interface ToggleButtonsProps {
    children: React.ReactNode;
    className?: string;
    size?: "sm" | "md" | "lg";
    variant?: "primary" | "secondary" | "outline";
    fullWidth?: boolean;
}

export const ToggleButtons: React.FC<ToggleButtonsProps> = ({
    children,
    className,
    size = "md",
    variant = "secondary",
    fullWidth = false,
}) => {
    // Filter valid button elements
    const buttons = React.Children.toArray(children).filter(
        (child): child is ReactElement<ButtonProps> =>
            React.isValidElement(child) &&
            (child.type === Button || typeof child.type === "function")
    );

    if (buttons.length === 0) {
        console.warn("ToggleButton expects Button components as children");
        return null;
    }

    return (
        <div className={cn("inline-flex", fullWidth && "w-full", className)}>
            {buttons.map((button, index) => {
                const isFirst = index === 0;
                const isLast = index === buttons.length - 1;
                const isDisabled = !!button.props.disabled;

                // Clone the button with modified className to handle border radius and borders
                return React.cloneElement(button, {
                    className: cn(
                        button.props.className,
                        "rounded-none border-r-0",
                        isFirst && "rounded-l-md",
                        isLast && "rounded-r-md border-r",
                        !isFirst && "border-l-0", // Remove left border for all but first
                        fullWidth && "flex-1",
                        // When buttons are adjacent, make sure the z-index creates proper overlapping
                        isDisabled ? "relative z-0" : "relative z-10"
                    ),
                    key: index,
                    size: button.props.size || size,
                    variant: button.props.variant || variant,
                });
            })}
        </div>
    );
};

export default ToggleButtons;
