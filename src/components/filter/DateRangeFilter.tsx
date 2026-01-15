// src/components/common/ui/DateRangeFilter.tsx
import { LuCalendar } from "react-icons/lu";
import { FILTER_LIMITS } from "@/constants/filters";
import { formatDate } from "@/lib/format";
import { RangeFilter, Range } from "@/components/filter/RangeFilter";

export interface DateRange {
    from: Date;
    to: Date;
}

export interface DateRangeFilterProps {
    label: string;
    value: DateRange;
    onChange: (value: DateRange) => void;
    maxDateSpan?: number; // Maximum span in days (optional)
    className?: string;
}

export const DateRangeFilter = ({
    label,
    value,
    onChange,
    className,
}: DateRangeFilterProps) => {
    // Get the current date values for quick ranges
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Create quick date ranges
    const quickRanges = [
        {
            label: "This month",
            min: new Date(currentYear, currentMonth, 1),
            max: new Date(currentYear, currentMonth + 1, 0),
        },
        {
            label: "Last 3 months",
            min: new Date(currentYear, currentMonth - 2, 1),
            max: new Date(currentYear, currentMonth + 1, 0),
        },
        {
            label: "Last 6 months",
            min: new Date(currentYear, currentMonth - 5, 1),
            max: new Date(currentYear, currentMonth + 1, 0),
        },
        {
            label: "This year",
            min: new Date(currentYear, 0, 1),
            max: new Date(currentYear, 11, 31),
        },
        {
            label: "Last year",
            min: new Date(currentYear - 1, 0, 1),
            max: new Date(currentYear - 1, 11, 31),
        },
        {
            label: "All time",
            min: FILTER_LIMITS.DATE_VALUE.MIN,
            max: FILTER_LIMITS.DATE_VALUE.MAX,
        },
    ];

    // Map our date values to the expected format
    const mappedValue: Range<Date> = {
        min: value.from,
        max: value.to,
    };

    // Function to parse date input values
    const parseDateValue = (dateStr: string): Date | null => { 
        if (!dateStr) return null;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0); // Get just the day, no time
        return date;
    };

    // Handler for the BaseRangeFilter onChange
    const handleRangeChange = (newRange: Range<Date>) => {
        onChange({
            from: newRange.min,
            to: newRange.max,
        });
    };

    return (
        <RangeFilter<Date>
            label={label}
            icon={LuCalendar}
            value={mappedValue}
            onChange={handleRangeChange}
            formatValue={formatDate}
            parseValue={parseDateValue}
            quickRanges={quickRanges}
            limitMin={FILTER_LIMITS.DATE_VALUE.MIN}
            limitMax={FILTER_LIMITS.DATE_VALUE.MAX}
            inputType="date"
            inputLabels={{ min: "From", max: "To" }}
            className={className}
        />
    );
};
