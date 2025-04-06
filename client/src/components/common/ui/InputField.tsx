// src/components/common/ui/InputField.tsx
import React, { forwardRef } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface InputFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Label text for the input field */
    label?: string;
    /** Icon to display at the start of the input */
    icon?: LucideIcon;
    /** Icon to display at the end of the input */
    trailingIcon?: LucideIcon;
    /** If true, adds a red border and displays error message */
    error?: string;
    /** Function called when the trailing icon is clicked */
    onTrailingIconClick?: () => void;
    /** Optional helper text shown below the input */
    helperText?: string;
    /** Additional CSS classes for the wrapper div */
    wrapperClassName?: string;
    /** Additional CSS classes for the input element */
    inputClassName?: string;
    /** Additional CSS classes for the label element */
    labelClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    (
        {
            label,
            icon: Icon,
            trailingIcon: TrailingIcon,
            error,
            onTrailingIconClick,
            helperText,
            wrapperClassName,
            inputClassName,
            labelClassName,
            disabled,
            required,
            id,
            ...props
        },
        ref
    ) => {
        // Generate a unique ID if none is provided
        const inputId =
            id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className={cn("space-y-1", wrapperClassName)}>
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "pl-2 block text-sm font-medium text-gray-700",
                            error && "text-red-600",
                            labelClassName
                        )}
                    >
                        {label}
                        {required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>
                )}

                {/* Input Container */}
                <div className="relative">
                    {/* Leading Icon */}
                    {Icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Icon className="h-5 w-5" />
                        </div>
                    )}

                    {/* Input Element */}
                    <input
                        id={inputId}
                        ref={ref}
                        disabled={disabled}
                        required={required}
                        className={cn(
                            "w-full rounded-2xl border py-2.5 bg-white focus:outline-none focus:ring-1",
                            Icon ? "pl-10" : "pl-3",
                            TrailingIcon ? "pr-10" : "pr-3",
                            error
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-200 focus:border-gray-300 focus:ring-gray-300",
                            disabled &&
                                "bg-gray-50 text-gray-500 cursor-not-allowed",
                            inputClassName
                        )}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={
                            error
                                ? `${inputId}-error`
                                : helperText
                                ? `${inputId}-description`
                                : undefined
                        }
                        {...props}
                    />

                    {/* Trailing Icon */}
                    {TrailingIcon && (
                        <button
                            type="button"
                            className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
                                !onTrailingIconClick &&
                                    "cursor-default pointer-events-none",
                                disabled && "opacity-50 pointer-events-none"
                            )}
                            onClick={onTrailingIconClick}
                            disabled={disabled}
                            tabIndex={!onTrailingIconClick ? -1 : 0}
                            aria-hidden={!onTrailingIconClick}
                        >
                            <TrailingIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Error Message or Helper Text */}
                {(error || helperText) && (
                    <div
                        id={
                            error
                                ? `${inputId}-error`
                                : `${inputId}-description`
                        }
                        className={cn(
                            "text-xs",
                            error ? "text-red-600" : "text-gray-500"
                        )}
                    >
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

InputField.displayName = "InputField";

export default InputField;
