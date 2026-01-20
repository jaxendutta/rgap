import React, { InputHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ label, id, className, error, ...props }, ref) => {
        // 1. Generate a stable ID for hydration
        const generatedId = useId();
        // 2. Use the provided ID if it exists, otherwise use the generated one
        const inputId = id || generatedId;

        return (
            <div className="w-full space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="pl-2 block text-xs md:text-sm font-medium text-gray-700"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        id={inputId}
                        ref={ref}
                        className={cn(
                            "w-full px-4 text-sm md:text-base rounded-3xl border py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200",
                            error ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="pl-2 text-xs md:text-sm text-red-600 animate-in slide-in-from-top-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

InputField.displayName = "InputField";

export default InputField;
