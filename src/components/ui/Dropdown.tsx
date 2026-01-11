// src/components/ui/Dropdown.tsx
import React, { useState, useEffect, useRef, ReactNode } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Button from "./Button";

export interface Option {
    value: string;
    label: string;
}

export interface DropdownProps {
    icon?: LucideIcon;
    label?: string;
    value: string | string[];
    options: (Option | string)[];
    onChange: (value: any) => void;
    multiple?: boolean;
    className?: string;
    placeholder?: string;
    renderOption?: (option: Option) => ReactNode;
}

const normalizeOption = (option: Option | string): Option => {
    if (typeof option === "string") {
        return { value: option, label: option };
    }
    return option;
};

export const Dropdown = ({
    icon,
    label,
    value,
    options,
    onChange,
    multiple = false,
    className,
    placeholder = "Select",
    renderOption,
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const normalizedOptions = options.map(normalizeOption);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggleOption = (optionValue: string) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = currentValues.includes(optionValue)
                ? currentValues.filter((v) => v !== optionValue)
                : [...currentValues, optionValue];
            onChange(newValues);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    const getDisplayValue = () => {
        if (multiple) {
            const selectedCount = Array.isArray(value) ? value.length : 0;
            return selectedCount ? `${selectedCount} selected` : placeholder;
        }

        const selectedOption = normalizedOptions.find(
            (opt) => opt.value === value
        );
        return selectedOption ? selectedOption.label : placeholder;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant={"outline"}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm border hover:shadow-sm transition-all duration-200",
                    isOpen && "border-gray-300 ring-1 ring-gray-300",
                    className
                )}
            >
                <div className="flex items-center gap-2">
                    {icon && React.createElement(icon, { className: "h-4 w-4 text-gray-500" })}
                    {label && <span className="font-medium whitespace-nowrap">{label}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-600 italic whitespace-nowrap">{getDisplayValue()}</span>
                    <ChevronDown
                        className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </div>
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden"
                    >
                        <div className="p-2 max-h-60 overflow-auto space-y-1 custom-scrollbar">
                            {normalizedOptions.map((option) => {
                                const isSelected = multiple
                                    ? Array.isArray(value) &&
                                    value.includes(option.value)
                                    : value === option.value;

                                if (renderOption) {
                                    return (
                                        <div
                                            key={option.value}
                                            onClick={() =>
                                                handleToggleOption(option.value)
                                            }
                                            className="cursor-pointer"
                                        >
                                            {renderOption(option)}
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={option.value}
                                        onClick={() =>
                                            handleToggleOption(option.value)
                                        }
                                        className={cn(
                                            "flex items-center p-2 hover:bg-blue-50 rounded-md cursor-pointer transition-colors",
                                            isSelected && "bg-blue-50 text-blue-700"
                                        )}
                                    >
                                        {multiple && (
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={isSelected}
                                                onChange={() => { }}
                                            />
                                        )}
                                        <span
                                            className={cn(
                                                "text-sm",
                                                multiple && "ml-2",
                                                isSelected && "font-medium"
                                            )}
                                        >
                                            {option.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
