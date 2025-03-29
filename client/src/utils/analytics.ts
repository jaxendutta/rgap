// src/utils/analytics.ts
import { Grant, Recipient } from "@/types/models";

/**
 * Calculate funding growth trend between first and last year
 */
export const calculateFundingGrowth = (grants: Grant[]) => {
    if (!grants || grants.length < 2) {
        return {
            text: "Insufficient data",
            percentChange: 0,
            firstYearValue: 0,
            lastYearValue: 0,
            yearsSpan: 0,
            trendDirection: "neutral",
        };
    }

    // Group by year
    const yearlyData: Record<number, number> = {};

    grants.forEach((grant) => {
        if (!grant.agreement_start_date || !grant.agreement_value) return;

        // Ensure we're dealing with a valid date
        try {
            const year = new Date(grant.agreement_start_date).getFullYear();
            if (isNaN(year)) return;

            // Ensure agreement_value is a number
            const value = Number(grant.agreement_value);
            if (isNaN(value)) return;

            yearlyData[year] = (yearlyData[year] || 0) + value;
        } catch (e) {
            // Skip this grant if date parsing fails
            return;
        }
    });

    // Get years sorted
    const years = Object.keys(yearlyData).map(Number).sort();

    if (years.length < 2) {
        return {
            text: "Insufficient data",
            percentChange: 0,
            firstYearValue: 0,
            lastYearValue: 0,
            yearsSpan: 0,
            trendDirection: "neutral",
        };
    }

    // Compare first and last year
    const firstYearValue = yearlyData[years[0]];
    const lastYearValue = yearlyData[years[years.length - 1]];

    // Prevent division by zero
    if (firstYearValue === 0) {
        return {
            text: "Cannot calculate (zero base value)",
            percentChange: 0,
            firstYearValue: 0,
            lastYearValue,
            yearsSpan: years.length,
            trendDirection: "neutral",
        };
    }

    const percentChange =
        ((lastYearValue - firstYearValue) / firstYearValue) * 100;

    return {
        text: `${percentChange > 0 ? "+" : ""}${percentChange.toFixed(
            1
        )}% over ${years.length} years`,
        percentChange,
        firstYearValue,
        lastYearValue,
        yearsSpan: years.length,
        trendDirection:
            percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral",
    };
};

/**
 * Calculate agency specialization (which agency provides most funding)
 */
export const calculateAgencySpecialization = (grants: Grant[]) => {
    if (!grants || grants.length === 0) {
        return {
            text: "No grants data",
            topAgency: null,
            topPercentage: 0,
            specialization: "Unknown",
            agencyData: [],
        };
    }

    // Calculate funding by agency
    const agencyFunding: Record<string, number> = {};
    let totalFunding = 0;

    grants.forEach((grant) => {
        // Ensure we have valid data
        if (!grant.org || !grant.agreement_value) return;

        // Convert agreement_value to a number if it's not already
        const value = Number(grant.agreement_value);
        if (isNaN(value)) return;

        // Add to agency total
        agencyFunding[grant.org] = (agencyFunding[grant.org] || 0) + value;
        totalFunding += value;
    });

    // Sort agencies by funding amount
    const sortedAgencies = Object.entries(agencyFunding).sort(
        (a, b) => b[1] - a[1]
    );

    if (sortedAgencies.length === 0 || totalFunding === 0) {
        return {
            text: "No agency data",
            topAgency: null,
            topPercentage: 0,
            specialization: "Unknown",
            agencyData: [],
        };
    }

    const topAgency = sortedAgencies[0];
    const topAgencyPercentage = (topAgency[1] / totalFunding) * 100;

    let specialization;
    if (topAgencyPercentage > 80) specialization = "Highly Specialized";
    else if (topAgencyPercentage > 50) specialization = "Specialized";
    else specialization = "Diversified";

    return {
        text: `${specialization}: ${
            topAgency[0]
        } (${topAgencyPercentage.toFixed(1)}%)`,
        topAgency: topAgency[0],
        topPercentage: topAgencyPercentage,
        specialization,
        agencyData: sortedAgencies.map(([agency, funding]) => ({
            agency,
            funding,
            percentage: (funding / totalFunding) * 100,
        })),
    };
};

/**
 * Extract all unique agencies from grants
 */
export const extractAgenciesFromGrants = (grants: Grant[]): string[] => {
    if (!grants || grants.length === 0) return [];

    return Array.from(new Set(grants.map((grant) => grant.org)))
        .filter(Boolean) // Filter out empty values
        .sort(); // Sort alphabetically for consistent order
};

/**
 * Calculate recipient concentration
 */
export const calculateRecipientConcentration = (
    recipients: any[],
    totalFunding: number
) => {
    if (!recipients || recipients.length === 0 || totalFunding <= 0) {
        return { concentration: 0, rating: "Unknown", topRecipients: [] };
    }

    const sortedRecipients = [...recipients].sort(
        (a, b) => (b.total_funding || 0) - (a.total_funding || 0)
    );

    const top3 = sortedRecipients.slice(
        0,
        Math.min(3, sortedRecipients.length)
    );
    const top3Funding = top3.reduce(
        (sum, r) => sum + (r.total_funding || 0),
        0
    );
    const concentration = (top3Funding / totalFunding) * 100;

    let rating;
    if (concentration > 80) rating = "Highly Concentrated";
    else if (concentration > 50) rating = "Moderately Concentrated";
    else rating = "Diverse";

    return {
        concentration,
        rating,
        topRecipients: top3.map((r) => ({
            id: r.recipient_id,
            name: r.legal_name,
            funding: r.total_funding || 0,
            percentage: ((r.total_funding || 0) / totalFunding) * 100,
        })),
    };
};

/**
 * Calculate average grant duration
 */
export const calculateAvgGrantDuration = (grants: Grant[]) => {
    if (!grants || grants.length === 0) {
        return { months: 0, text: "N/A" };
    }

    // Function to safely check date validity
    const isValidDate = (dateStr: string | undefined): boolean => {
        if (!dateStr) return false;

        try {
            const date = new Date(dateStr);
            return !isNaN(date.getTime());
        } catch (e) {
            return false;
        }
    };

    const durations = grants
        .filter(
            (grant) =>
                isValidDate(grant.agreement_start_date) &&
                isValidDate(grant.agreement_end_date)
        )
        .map((grant) => {
            try {
                const start = new Date(grant.agreement_start_date);
                const end = new Date(grant.agreement_end_date);

                // Duration in months, handling invalid dates
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return null;
                }

                // Only count positive durations
                const duration = Math.round(
                    (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24 * 30)
                );
                return duration > 0 ? duration : null;
            } catch (e) {
                return null;
            }
        })
        .filter(
            (months): months is number =>
                months !== null && !isNaN(months) && months > 0
        );

    if (durations.length === 0) {
        return { months: 0, text: "N/A" };
    }

    const avgDuration =
        durations.reduce((sum, d) => sum + d, 0) / durations.length;

    if (isNaN(avgDuration)) {
        return { months: 0, text: "N/A" };
    }

    const roundedMonths = Math.round(avgDuration);

    if (roundedMonths < 12) {
        return { months: roundedMonths, text: `${roundedMonths} months` };
    } else {
        const years = Math.floor(roundedMonths / 12);
        const remainingMonths = roundedMonths % 12;

        if (remainingMonths === 0) {
            return {
                months: roundedMonths,
                text: `${years} ${years === 1 ? "year" : "years"}`,
            };
        } else {
            return {
                months: roundedMonths,
                text: `${years} ${
                    years === 1 ? "year" : "years"
                }, ${remainingMonths} ${
                    remainingMonths === 1 ? "month" : "months"
                }`,
            };
        }
    }
};

/**
 * Calculate active recipients (with grants in the last X years)
 */
export const calculateActiveRecipients = (
    recipients: Recipient[],
    grants: Grant[],
    years = 2
) => {
    if (!recipients || recipients.length === 0) {
        return {
            active: 0,
            total: 0,
            text: "No recipient data",
            percentage: 0,
        };
    }

    // Calculate recipients with recent grants
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - years);

    let activeCount = 0;
    recipients.forEach((recipient) => {
        const hasRecentGrant = grants.some(
            (grant) =>
                grant.recipient_id === recipient.recipient_id &&
                new Date(grant.agreement_start_date) >= cutoffDate
        );
        if (hasRecentGrant) activeCount++;
    });

    const percentage =
        recipients.length > 0 ? (activeCount / recipients.length) * 100 : 0;

    return {
        active: activeCount,
        total: recipients.length,
        percentage,
        text: `${activeCount.toLocaleString()} / ${recipients.length.toLocaleString()} (${percentage.toFixed(
            1
        )}%)`,
    };
};
