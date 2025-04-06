// src/components/common/ui/ValueRangeFilter.tsx
import { CircleDollarSign, Calendar } from "lucide-react";
import { FILTER_LIMITS } from "@/constants/filters";
import { formatDate, formatCurrency } from "@/utils/format";
import { RangeFilter } from "@/components/features/filter/RangeFilter";

export interface RangeValue {
    min: number | Date;
    max: number | Date;
}

export interface ValueRangeFilterProps {
    label: string;
    type: "currency" | "year";
    value: RangeValue;
    onChange: (value: RangeValue) => void;
    className?: string;
}

export const ValueRangeFilter = ({
    label,
    type,
    value,
    onChange,
    className,
}: ValueRangeFilterProps) => {
    // Get limits based on type
    const limits =
        type === "currency"
            ? FILTER_LIMITS.GRANT_VALUE
            : FILTER_LIMITS.DATE_VALUE;

    // Get current year for year ranges
    const currentYear = new Date().getFullYear();

    // Create appropriate quick ranges based on type
    const quickRanges =
        type === "year"
            ? [
                  {
                      label: "Last 5 years",
                      min: currentYear - 4,
                      max: currentYear,
                  },
                  {
                      label: "Last 10 years",
                      min: currentYear - 9,
                      max: currentYear,
                  },
                  { label: "All time", min: limits.MIN, max: limits.MAX },
              ]
            : [
                  { label: "Under $50k", min: 0, max: 50_000 },
                  { label: "$50k - $200k", min: 50_000, max: 200_000 },
                  { label: "$200k - $1M", min: 200_000, max: 1_000_000 },
                  { label: "Over $1M", min: 1_000_000, max: limits.MAX },
                  { label: "All values", min: limits.MIN, max: limits.MAX },
              ];

    // Format value based on type
    const formatValue = (val: number | Date) => {
        if (val instanceof Date) {
            return formatDate(val);
        }
        if (type === "currency") {
            return formatCurrency(val);
        }
        return val.toString();
    };

    // Parse input values based on type
    const parseInputValue = (rawValue: string): number | Date | null => {
        if (type === "currency" || type === "year") {
            const cleanValue = rawValue.replace(/[^0-9.]/g, "");
            const numValue = Number(cleanValue);
            return !isNaN(numValue) ? numValue : null;
        }
        return null;
    };

    // Get appropriate icon based on type
    const icon = type === "currency" ? CircleDollarSign : Calendar;

    return (
        <RangeFilter<number | Date>
            label={label}
            icon={icon}
            value={value}
            onChange={onChange}
            formatValue={formatValue}
            parseValue={parseInputValue}
            quickRanges={quickRanges}
            limitMin={limits.MIN}
            limitMax={limits.MAX}
            inputType="text"
            inputLabels={{ min: "Minimum", max: "Maximum" }}
            className={className}
        />
    );
};
