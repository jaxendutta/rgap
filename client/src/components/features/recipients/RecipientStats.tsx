// src/components/features/recipients/RecipientStats.tsx
import { ResearchGrant } from "@/types/models";
import StatDisplay, { StatItem } from "@/components/common/ui/StatDisplay";
import { BookMarked, DollarSign, Users, Calendar } from "lucide-react";
import { formatCurrency } from "@/utils/format";

interface RecipientStatsProps {
    recipient: any;
    processedGrants: ResearchGrant[];
    agencies: string[];
    expandedStats: boolean;
    setExpandedStats: (expanded: boolean) => void;
}

const RecipientStats = ({
    recipient,
    processedGrants,
    agencies,
    expandedStats,
    setExpandedStats,
}: RecipientStatsProps) => {
    // Calculate stats
    const uniqueGrantCount = processedGrants.length;
    const totalFunding = processedGrants.reduce(
        (sum, grant) => sum + grant.agreement_value,
        0
    );
    const totalYears =
        recipient.latest_grant_date && recipient.first_grant_date
            ? new Date(recipient.latest_grant_date).getFullYear() -
              new Date(recipient.first_grant_date).getFullYear() +
              1
            : 0;
    const averagePerYear = totalYears > 0 ? totalFunding / totalYears : 0;
    const averageGrantValue =
        uniqueGrantCount > 0 ? totalFunding / uniqueGrantCount : 0;

    // Create an array of stat items
    const statItems: StatItem[] = [
        {
            icon: BookMarked,
            label: "Unique Grants",
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
        {
            icon: Calendar,
            label: "Active Period",
            value:
                recipient.first_grant_date && recipient.latest_grant_date
                    ? `${new Date(
                          recipient.first_grant_date
                      ).getFullYear()} - ${new Date(
                          recipient.latest_grant_date
                      ).getFullYear()}`
                    : "N/A",
        },
        // Additional stats shown when expanded
        {
            icon: DollarSign,
            label: "Annual Average",
            value: formatCurrency(averagePerYear),
        },
        {
            icon: BookMarked,
            label: "Funding Agencies",
            value: recipient.funding_agencies_count || agencies.length,
        },
        {
            icon: Calendar,
            label: "Duration Range",
            value:
                processedGrants.length > 0
                    ? (() => {
                          // Calculate durations in months
                          const durations = processedGrants
                              .map((grant) => {
                                  const start = new Date(
                                      grant.agreement_start_date
                                  );
                                  const end = new Date(
                                      grant.agreement_end_date
                                  );
                                  return Math.round(
                                      (end.getTime() - start.getTime()) /
                                          (1000 * 60 * 60 * 24 * 30)
                                  );
                              })
                              .sort((a, b) => a - b);

                          const min = durations[0];
                          const max = durations[durations.length - 1];

                          return min === max
                              ? `${min} months`
                              : `${min} - ${max} months`;
                      })()
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

export default RecipientStats;
