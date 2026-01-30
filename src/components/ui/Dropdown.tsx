// src/components/ui/Dropdown.tsx
'use client';

import React, { useState, useEffect, useRef, ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { IconType } from "react-icons";
import { cn, getTextWidth } from "@/lib/utils";
import Button from "@/components/ui/Button";

export interface Option {
    value: string;
    label: string;
}

export interface DropdownProps {
    icon?: IconType;
    label?: string;
    value: string | string[];
    options: (Option | string)[];
    onChange: (value: any) => void;
    multiple?: boolean;
    className?: string;
    placeholder?: string;
    renderOption?: (option: Option) => ReactNode;
    disabled?: boolean;
    fullWidth?: boolean;
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
    disabled,
    fullWidth = false,
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownWidth, setDropdownWidth] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const normalizedOptions = options.map(normalizeOption);

    useEffect(() => {
        const button = dropdownRef.current?.querySelector('button');
        if (!button) return;

        const font = window.getComputedStyle(button).font;
        const placeholderWidth = getTextWidth(placeholder, font);
        const optionsWidth = Math.max(...normalizedOptions.map(o => getTextWidth(o.label, font)));

        let selectedValueWidth = 0;
        if (multiple) {
            const selectedCount = Array.isArray(value) ? value.length : 0;
            if (selectedCount > 0) {
                selectedValueWidth = getTextWidth(`${selectedCount} selected`, font);
            }
        } else {
            const selectedOption = normalizedOptions.find(opt => opt.value === value);
            if (selectedOption) {
                selectedValueWidth = getTextWidth(selectedOption.label, font);
            }
        }

        const maxWidth = Math.max(placeholderWidth, optionsWidth, selectedValueWidth);

        // Add some padding for the icon and chevron
        setDropdownWidth(maxWidth + 80);
    }, [options, placeholder, value, normalizedOptions]);

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
                style={{ width: fullWidth ? undefined : (dropdownWidth ? `${dropdownWidth}px` : undefined) }}
                className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs md:text-sm border hover:shadow-sm transition-all duration-200 bg-white",
                    fullWidth && "w-full",
                    isOpen && "border-gray-300 ring-1 ring-gray-300",
                    className
                )}
                disabled={disabled}
            >
                {/* Icon and Label */}
                {(icon || label) && (
                <div className="flex flex-1 items-center gap-2">
                    {icon && React.createElement(icon, { className: "h-3 md:h-4 w-3 md:w-4 text-gray-500" })}
                    {label && <span className="font-medium whitespace-nowrap">{label}</span>}
                </div>
                )}

                {/* Display Value and Chevron Icon */}
                <div className="flex flex-1 items-center justify-between gap-1">
                    <span className="text-gray-600 italic whitespace-nowrap">{getDisplayValue()}</span>

                    <LuChevronDown
                        className={cn(
                            "w-4 h-4 text-gray-400 transition-transform",
                            isOpen && "transform rotate-180"
                        )}
                    />
                </div>
            </Button>

            {isOpen && (
                <div
                    style={{ width: fullWidth ? undefined : (dropdownWidth ? `${dropdownWidth}px` : undefined) }}
                    className={cn(
                        "absolute z-50 mt-1 bg-white rounded-2xl shadow-lg border border-gray-300 overflow-hidden",
                        fullWidth && "w-full"
                    )}
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
                                            "text-xs md:text-sm",
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
                </div>
            )}
        </div>
    );
};

export default Dropdown;
