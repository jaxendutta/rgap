// src/components/common/ui/RangeFilter.tsx
import { useState, useEffect, useRef } from "react";
import {
    ChevronDown,
    Calendar,
    CircleDollarSign,
    LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

// Generic range type that can work with both dates and numbers
export interface Range<T> {
    min: T;
    max: T;
}

// Base props for all range filter components
export interface RangeFilterProps<T> {
    label: string;
    icon?: LucideIcon;
    value: Range<T>;
    onChange: (value: Range<T>) => void;
    formatValue: (val: T) => string;
    parseValue?: (rawValue: string) => T | null;
    quickRanges: Array<{
        label: string;
        min: T;
        max: T;
    }>;
    limitMin: T;
    limitMax: T;
    inputType?: "text" | "date" | "number"; // Type of input field to render
    inputLabels?: { min: string; max: string }; // Custom labels for min/max fields
    className?: string;
}

export function RangeFilter<T>({
    label,
    icon: Icon,
    value,
    onChange,
    formatValue,
    parseValue,
    quickRanges,
    limitMin,
    limitMax,
    inputType = "text",
    inputLabels = { min: "Minimum", max: "Maximum" },
    className,
}: RangeFilterProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [localValue, setLocalValue] = useState<Range<T>>(value);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get default icon based on type
    const DefaultIcon =
        typeof value.min === "number" || typeof value.min === "string"
            ? CircleDollarSign
            : Calendar;

    const FinalIcon = Icon || DefaultIcon;

    // Format display value
    const displayValue =
        value.min === limitMin && value.max === limitMax
            ? "Any"
            : `${formatValue(value.min)} - ${formatValue(value.max)}`;

    // Update local state when props change
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

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

    // Generic input handler
    const handleValueChange = (field: "min" | "max", rawValue: string) => {
        if (parseValue) {
            const parsedValue = parseValue(rawValue);
            if (parsedValue !== null) {
                setLocalValue((prev) => ({
                    ...prev,
                    [field]: parsedValue,
                }));
            }
        }
    };

    const handleApply = () => {
        onChange(localValue);
        setIsOpen(false);
    };

    // Handle selecting a quick range
    const handleQuickRangeSelect = (range: { min: T; max: T }) => {
        // Update the local value
        setLocalValue({
            min: range.min,
            max: range.max,
        });

        // Call the onChange handler immediately
        onChange({
            min: range.min,
            max: range.max,
        });

        // Close the dropdown
        setIsOpen(false);

        // Force a small delay before letting the change propagate
        // This helps ensure the parent component has time to update its state
        setTimeout(() => {
            // This is a trick to make sure the browser has time to process the state change
            // before the user might click elsewhere
            document.body.click();
        }, 50);
    };

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-sm border rounded-md hover:bg-gray-50",
                    isOpen && "border-gray-300 ring-1 ring-gray-300"
                )}
            >
                <span className="flex items-center gap-2">
                    <FinalIcon className="h-4 w-4 text-gray-500" />
                    <span className="font-medium whitespace-nowrap">{label}</span>
                    <span className="text-gray-600 italic">{displayValue}</span>
                </span>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isOpen && "transform rotate-180"
                    )}
                />
            </button>

            {isOpen && (
                <div 
                    className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg border"
                    ref={(el) => {
                        if (el && dropdownRef.current) {
                            // Get viewport dimensions
                            const viewportWidth = window.innerWidth;
                            const viewportHeight = window.innerHeight;
                            
                            // Get dropdown dimensions
                            const rect = el.getBoundingClientRect();
                            const buttonRect = dropdownRef.current.getBoundingClientRect();
                            
                            // Check for overflow
                            const overflowRight = rect.right > viewportWidth;
                            const overflowBottom = rect.bottom > viewportHeight;
                            const overflowLeft = rect.left < 0;
                            
                            // Adjust horizontal position if needed
                            if (overflowRight) {
                                el.style.left = 'auto';
                                el.style.right = '0';
                            } else if (overflowLeft) {
                                el.style.left = '0';
                                el.style.right = 'auto';
                            }
                            
                            // Adjust vertical position if needed
                            if (overflowBottom) {
                                const spaceAbove = buttonRect.top;
                                const spaceBelow = viewportHeight - buttonRect.bottom;
                                
                                // Flip dropdown upward if more space above than below
                                if (spaceAbove > spaceBelow) {
                                    el.style.top = 'auto';
                                    el.style.bottom = '100%';
                                    el.style.marginTop = '0';
                                    el.style.marginBottom = '0.25rem';
                                } else {
                                    // Otherwise, just constrain the height
                                    el.style.maxHeight = `${viewportHeight - rect.top - 20}px`;
                                    el.style.overflowY = 'auto';
                                }
                            }
                        }
                    }}
                >
                    <div className="p-4">
                        <div className="mb-4 space-y-1">
                            {quickRanges.map((range) => (
                                <button
                                    key={range.label}
                                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-50 rounded"
                                    onClick={() =>
                                        handleQuickRangeSelect(range)
                                    }
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            {/* Input fields based on inputType */}
                            <div className="flex items-center justify-between space-x-2">
                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        {inputLabels.min}
                                    </label>
                                    {inputType === "date" ? (
                                        <input
                                            type="date"
                                            value={
                                                localValue.min instanceof Date
                                                    ? (localValue.min as Date)
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : String(localValue.min)
                                            }
                                            onChange={(e) =>
                                                handleValueChange(
                                                    "min",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-1.5 text-sm border rounded-md"
                                        />
                                    ) : (
                                        <input
                                            type={inputType}
                                            value={formatValue(localValue.min)}
                                            onChange={(e) =>
                                                handleValueChange(
                                                    "min",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-1.5 text-sm border rounded-md"
                                        />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        {inputLabels.max}
                                    </label>
                                    {inputType === "date" ? (
                                        <input
                                            type="date"
                                            value={
                                                localValue.max instanceof Date
                                                    ? (localValue.max as Date)
                                                          .toISOString()
                                                          .split("T")[0]
                                                    : String(localValue.max)
                                            }
                                            onChange={(e) =>
                                                handleValueChange(
                                                    "max",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-1.5 text-sm border rounded-md"
                                        />
                                    ) : (
                                        <input
                                            type={inputType}
                                            value={formatValue(localValue.max)}
                                            onChange={(e) =>
                                                handleValueChange(
                                                    "max",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full px-3 py-1.5 text-sm border rounded-md"
                                        />
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleApply}
                                className="w-full mt-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Apply Range
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
