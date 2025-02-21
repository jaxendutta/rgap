// src/components/common/ui/MultiSelect.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export interface MultiSelectProps {
    label: string;
    options: string[];
    values: string[];
    onChange: (values: string[]) => void;
}

export const MultiSelect = ({
    label,
    options = [],
    values = [],
    onChange,
}: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const handleToggleOption = useCallback(
        (option: string) => {
            let newValues: string[];
            if (values.includes(option)) {
                newValues = values.filter((v) => v !== option);
            } else {
                newValues = [...values, option];
            }
            console.log("MultiSelect toggle:", {
                option,
                oldValues: values,
                newValues,
            });
            onChange(newValues);
        },
        [values, onChange]
    );

    const selectedDisplay = values.length ? `${values.length} selected` : "Any";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md hover:bg-gray-50",
                    isOpen && "border-gray-300 ring-1 ring-gray-300"
                )}
            >
                <span className="flex items-center gap-2">
                    <span className="font-medium">{label}:</span>
                    <span className="text-gray-600">{selectedDisplay}</span>
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
                        {options.map((option) => (
                            <label
                                key={option}
                                className="flex items-center p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300"
                                    checked={values.includes(option)}
                                    onChange={() => handleToggleOption(option)}
                                />
                                <span className="ml-2 text-sm">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
