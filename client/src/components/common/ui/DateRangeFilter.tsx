// src/components/common/ui/DateRangeFilter.tsx
import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { FILTER_LIMITS } from "@/constants/filters";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

export interface DateRange {
    from: Date;
    to: Date;
}

export interface DateRangeFilterProps {
    label: string;
    value: DateRange;
    onChange: (value: DateRange) => void;
    maxDateSpan?: number; // Maximum span in days (optional)
}

export const DateRangeFilter = ({
    label,
    value,
    onChange,
}: DateRangeFilterProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localValue, setLocalValue] = useState<DateRange>(value);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayValue =
        localValue.from === FILTER_LIMITS.DATE_VALUE.MIN &&
        localValue.to === FILTER_LIMITS.DATE_VALUE.MAX
            ? "All time"
            : `${formatDate(localValue.from)} → ${formatDate(localValue.to)}`;

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

    // Get quick date ranges
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const quickRanges = [
        {
            label: "This month",
            from: new Date(currentYear, currentMonth, 1),
            to: new Date(currentYear, currentMonth + 1, 0),
        },
        {
            label: "Last 3 months",
            from: new Date(currentYear, currentMonth - 2, 1),
            to: new Date(currentYear, currentMonth + 1, 0),
        },
        {
            label: "Last 6 months",
            from: new Date(currentYear, currentMonth - 5, 1),
            to: new Date(currentYear, currentMonth + 1, 0),
        },
        {
            label: "This year",
            from: new Date(currentYear, 0, 1),
            to: new Date(currentYear, 11, 31),
        },
        {
            label: "Last year",
            from: new Date(currentYear - 1, 0, 1),
            to: new Date(currentYear - 1, 11, 31),
        },
        {
            label: "All time",
            from: FILTER_LIMITS.DATE_VALUE.MIN,
            to: FILTER_LIMITS.DATE_VALUE.MAX,
        },
    ];

    const handleDateChange = (type: "from" | "to", dateStr: string) => {
        // Parse the date string from the input
        const date = dateStr ? new Date(dateStr) : null;

        // Update local state
        setLocalValue((prev) => ({
            ...prev,
            [type]: date,
        }));

        // Immediately update parent state
        onChange({
            ...localValue,
            [type]: date,
        });
    };

    const handleApply = () => {
        onChange(localValue);
        setIsOpen(false);
    };

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
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{label}</span>
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
                <div className="absolute z-10 w-auto mt-1 bg-white rounded-lg shadow-lg border">
                    <div className="p-4">
                        <div className="mb-4 space-y-1">
                            {quickRanges.map((range) => (
                                <button
                                    key={range.label}
                                    className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-50 rounded"
                                    onClick={() => {
                                        onChange({
                                            from: range.from,
                                            to: range.to,
                                        });
                                        setIsOpen(false);
                                    }}
                                >
                                    {range.label}
                                </button>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 w-1/2">
                                    <input
                                        type="date"
                                        value={
                                            localValue.from
                                                ? localValue.from
                                                      .toISOString()
                                                      .split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            handleDateChange(
                                                "from",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-1.5 text-sm border rounded-md"
                                    />
                                </div>

                                <label className="block text-sm text-gray-600 mb-1">
                                    to
                                </label>

                                <div className="flex-1 w-1/2">
                                    <input
                                        type="date"
                                        value={
                                            localValue.to
                                                ? localValue.to
                                                      .toISOString()
                                                      .split("T")[0]
                                                : ""
                                        }
                                        onChange={(e) =>
                                            handleDateChange(
                                                "to",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-1.5 text-sm border rounded-md"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleApply}
                                className="w-full mt-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                            >
                                Apply Date Range
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
