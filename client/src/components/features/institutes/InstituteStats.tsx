// src/components/features/institutes/InstituteStats.tsx
import { Grant } from "@/types/models";
import StatDisplay, { StatItem } from "@/components/common/ui/StatDisplay";
import {
    BookMarked,
    DollarSign,
    Users,
    Calendar,
    GraduationCap,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface InstituteStatsProps {
    institute: any;
    processedGrants: Grant[];
    recipients: any[];
    agencies: string[];
    expandedStats: boolean;
    setExpandedStats: (expanded: boolean) => void;
}

const InstituteStats = ({
    institute,
    processedGrants,
    recipients,
    agencies,
    expandedStats,
    setExpandedStats,
}: InstituteStatsProps) => {
    // Calculate stats
    const uniqueGrantCount = processedGrants.length;
    const uniqueRecipientCount = recipients.length;

    const totalFunding = processedGrants.reduce(
        (sum, grant) => sum + grant.agreement_value,
        0
    );

    const totalYears =
        institute.latest_grant_date && institute.first_grant_date
            ? new Date(institute.latest_grant_date).getFullYear() -
              new Date(institute.first_grant_date).getFullYear() +
              1
            : 0;

    const averagePerYear = totalYears > 0 ? totalFunding / totalYears : 0;
    const averageGrantValue =
        uniqueGrantCount > 0 ? totalFunding / uniqueGrantCount : 0;
    const averageFundingPerRecipient =
        uniqueRecipientCount > 0 ? totalFunding / uniqueRecipientCount : 0;

    // Create an array of stat items
    const statItems: StatItem[] = [
        {
            icon: GraduationCap,
            label: "Recipients",
            value: uniqueRecipientCount,
        },
        {
            icon: BookMarked,
            label: "Total Grants",
            value: uniqueGrantCount,
        },
        {
            icon: DollarSign,
            label: "Total Funding",
            value: formatCurrency(totalFunding),
        },
        {
            icon: Users,
            label: "Average Grant",
            value: uniqueGrantCount ? formatCurrency(averageGrantValue) : "N/A",
        },
        // Additional stats shown when expanded
        {
            icon: DollarSign,
            label: "Annual Average",
            value: formatCurrency(averagePerYear),
        },
        {
            icon: DollarSign,
            label: "Per Recipient",
            value: formatCurrency(averageFundingPerRecipient),
        },
        {
            icon: BookMarked,
            label: "Funding Agencies",
            value: institute.funding_agencies_count || agencies.length,
        },
        {
            icon: Calendar,
            label: "Active Period",
            value:
                institute.first_grant_date && institute.latest_grant_date
                    ? `${new Date(
                          institute.first_grant_date
                      ).getFullYear()} - ${new Date(
                          institute.latest_grant_date
                      ).getFullYear()}`
                    : "N/A",
        },
    ];

    return (
        <StatDisplay
            items={statItems}
            columns={4}
            layout="grid"
            expandable={true}
            expanded={expandedStats}
            onToggleExpand={() => setExpandedStats(!expandedStats)}
        />
    );
};

export default InstituteStats;
