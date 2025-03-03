// src/components/common/ui/Dropdown.tsx
import { useState, useEffect, useRef, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface Option {
    value: string;
    label: string;
}

export interface DropdownProps {
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
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md hover:bg-gray-50",
                    isOpen && "border-gray-300 ring-1 ring-gray-300",
                    className
                )}
            >
                <span className="flex items-center gap-2">
                    {label && <span className="font-medium">{label}:</span>}
                    <span className="text-gray-600">{getDisplayValue()}</span>
                </span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isOpen && "transform rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border">
                    <div className="p-2 max-h-60 overflow-auto space-y-1">
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
                                        "flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer",
                                        isSelected && "bg-gray-50"
                                    )}
                                >
                                    {multiple && (
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300"
                                            checked={isSelected}
                                            onChange={() => {}}
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            "text-sm",
                                            multiple && "ml-2"
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
