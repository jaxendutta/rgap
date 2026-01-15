// src/components/filter/RangeFilter.tsx
import { useState, useEffect, useRef } from "react";
import {
    LuChevronDown,
    LuCalendar,
    LuCircleDollarSign
} from "react-icons/lu";
import { IconType } from "react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// Generic range type that can work with both dates and numbers
export interface Range<T> {
    min: T;
    max: T;
}

// Base props for all range filter components
export interface RangeFilterProps<T> {
    label: string;
    icon?: IconType;
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
    inputType?: "text" | "date" | "number";
    inputLabels?: { min: string; max: string };
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
            ? LuCircleDollarSign
            : LuCalendar;

    const FinalIcon = Icon || DefaultIcon;

    // Helper to correctly check equality for both Dates and Primitives
    const isEqual = (a: T, b: T) => {
        if (a instanceof Date && b instanceof Date) {
            return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
        }
        return a === b;
    };

    // Format display value
    // FIXED: Use isEqual() instead of === to handle Date objects correctly
    const displayValue =
        isEqual(value.min, limitMin) && isEqual(value.max, limitMax)
            ? "Any"
            : `${formatValue(value.min)} ${"\u2013"} ${formatValue(value.max)}`;

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
        setLocalValue({
            min: range.min,
            max: range.max,
        });

        onChange({
            min: range.min,
            max: range.max,
        });

        setIsOpen(false);

        // Force a small delay before letting the change propagate
        setTimeout(() => {
            document.body.click();
        }, 50);
    };

    return (
        <div className={cn("relative z-20", className)} ref={dropdownRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between w-full px-3 py-2 bg-white text-xs md:text-sm border hover:shadow-sm transition-all duration-200",
                    isOpen && "border-gray-300 ring-1 ring-gray-300"
                )}
            >
                <div className="flex items-center gap-2">
                    <FinalIcon className="h-3 md:h-4 w-3 md:w-4 text-gray-500" />
                    <span className="font-medium whitespace-nowrap">
                        {label}
                    </span>
                </div>
                <div className="flex w-full items-center gap-2">
                    <span className="text-gray-600 italic w-full">{displayValue}</span>
                    <LuChevronDown
                        className={cn(
                            "w-4 h-4 text-gray-400 transition-transform duration-200",
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
                        className="relative z-50 mt-1 w-full bg-white rounded-3xl shadow-lg border border-gray-300 overflow-hidden"
                        ref={(el) => {
                            if (el && dropdownRef.current) {
                                // Get viewport dimensions
                                const viewportWidth = window.innerWidth;
                                const viewportHeight = window.innerHeight;

                                // Get dropdown dimensions
                                const rect = el.getBoundingClientRect();
                                const buttonRect =
                                    dropdownRef.current.getBoundingClientRect();

                                // Check for overflow
                                const overflowRight = rect.right > viewportWidth;
                                const overflowLeft = rect.left < 0;
                                const overflowBottom = rect.bottom > viewportHeight;

                                // Adjust horizontal position
                                if (overflowRight) {
                                    el.style.left = "auto";
                                    el.style.right = "0";
                                } else if (overflowLeft) {
                                    el.style.left = "0";
                                    el.style.right = "auto";
                                }

                                // Adjust vertical position
                                if (overflowBottom) {
                                    const spaceAbove = buttonRect.top;
                                    const spaceBelow = viewportHeight - buttonRect.bottom;

                                    if (spaceAbove > spaceBelow) {
                                        el.style.top = "auto";
                                        el.style.bottom = "100%";
                                        el.style.marginTop = "0";
                                        el.style.marginBottom = "0.25rem";
                                    } else {
                                        el.style.maxHeight = `${viewportHeight - rect.top - 20}px`;
                                        el.style.overflowY = "auto";
                                    }
                                }
                            }
                        }}
                    >
                        <div className="p-4">
                            <div className="mb-4 space-y-1">
                                {quickRanges.map((range) => (
                                    <Button
                                        variant="ghost"
                                        pill={false}
                                        key={range.label}
                                        className="w-full px-2 py-1.5 text-left font-normal text-xs md:text-sm border border-gray-300 hover:bg-gray-50 hover:text-blue-600 transition-colors rounded-2xl"
                                        onClick={() =>
                                            handleQuickRangeSelect(range)
                                        }
                                    >
                                        {range.label}
                                    </Button>
                                ))}
                            </div>

                            <div className="border-t border-slate-300 pt-2">
                                <div className="flex items-center justify-between space-x-2">
                                    <div className="flex-1">
                                        <label className="block text-xs md:text-sm text-gray-600 mb-1">
                                            {inputLabels.min}
                                        </label>
                                        {inputType === "date" ? (
                                            <input
                                                type="date"
                                                value={
                                                    localValue.min instanceof Date
                                                        ? localValue.min.toISOString().split('T')[0]
                                                        : String(localValue.min)
                                                }
                                                onChange={(e) =>
                                                    handleValueChange("min", e.target.value)
                                                }
                                                className="w-full px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            />
                                        ) : (
                                            <input
                                                type={inputType}
                                                value={formatValue(localValue.min)}
                                                onChange={(e) =>
                                                    handleValueChange("min", e.target.value)
                                                }
                                                className="w-full px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-xs md:text-sm text-gray-600 mb-1">
                                            {inputLabels.max}
                                        </label>
                                        {inputType === "date" ? (
                                            <input
                                                type="date"
                                                value={
                                                    localValue.max instanceof Date
                                                        ? localValue.max.toISOString().split('T')[0]
                                                        : String(localValue.max)
                                                }
                                                onChange={(e) =>
                                                    handleValueChange("max", e.target.value)
                                                }
                                                className="w-full px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            />
                                        ) : (
                                            <input
                                                type={inputType}
                                                value={formatValue(localValue.max)}
                                                onChange={(e) =>
                                                    handleValueChange("max", e.target.value)
                                                }
                                                className="w-full px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-3xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleApply}
                                    className="w-full mt-4 bg-gray-900 hover:bg-black text-white text-xs md:text-sm"
                                >
                                    Apply Range
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default RangeFilter;
