// src/pages/RecipientProfilePage.tsx
import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookMarked, AlertCircle, LineChart } from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { LoadingSpinner } from "@/components/common/ui/LoadingSpinner";
import { useRecipientDetails } from "@/hooks/api/useRecipients";
import {
    GrantSortConfig,
    ChartType,
    ProfileTab,
    ChartMetric,
} from "@/types/search";
import { TabNavigation } from "@/components/common/ui/TabNavigation";
import { ResearchGrant } from "@/types/models";
import RecipientHeader from "@/components/features/recipients/RecipientHeader";
import RecipientStats from "@/components/features/recipients/RecipientStats";
import GrantsList from "@/components/features/grants/GrantsList";
import RecipientAnalytics from "@/components/features/recipients/RecipientAnalytics";

export const RecipientProfilePage = () => {
    const { id } = useParams();

    // Use the API hook to fetch recipient details
    const {
        data: recipientData,
        isLoading,
        isError,
        error,
    } = useRecipientDetails(id || "");

    const recipient = recipientData?.data;

    // Component state
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [sortConfig, setSortConfig] = useState<GrantSortConfig>({
        field: "date",
        direction: "desc",
    });
    const [chartType, setChartType] = useState<ChartType>("bar");
    const [chartMetric, setChartMetric] = useState<ChartMetric>("funding");
    const [activeTab, setActiveTab] = useState<ProfileTab>("grants");
    const [expandedStats, setExpandedStats] = useState(false);

    // Handle the error state
    if (isError) {
        return (
            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                    <h2 className="text-lg font-medium text-red-800 mb-2">
                        Error Loading Recipient
                    </h2>
                    <p className="text-red-700 mb-4">
                        {error instanceof Error
                            ? error.message
                            : "Failed to load recipient details. Please try again."}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    // Handle the loading state
    if (isLoading || !recipient) {
        return (
            <div className="max-w-7xl mx-auto p-4 lg:p-6 flex flex-col justify-center items-center h-64">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-gray-600">Loading recipient details...</p>
            </div>
        );
    }

    // If recipient not found
    if (!recipient) {
        return <Navigate to="/pageNotFound" />;
    }

    // Process grants to group by reference number and keep only the latest amendment
    const processedGrants = useMemo(() => {
        // Group grants by reference number
        const grantsByRef = recipient.grants.reduce((acc, grant) => {
            if (!acc[grant.ref_number]) {
                acc[grant.ref_number] = [];
            }
            acc[grant.ref_number].push(grant);
            return acc;
        }, {} as Record<string, ResearchGrant[]>);

        // For each reference number, get the grant with the highest amendment number
        return Object.values(grantsByRef).map((grants) => {
            // Sort by amendment number (descending)
            const sortedGrants = [...grants].sort((a, b) => {
                const aNum = Number(a.amendment_number || "0");
                const bNum = Number(b.amendment_number || "0");
                return bNum - aNum;
            });

            // Take the highest amendment (first after sorting)
            const latestGrant = sortedGrants[0];

            // Add amendment history to the grant
            return {
                ...latestGrant,
                legal_name: recipient.legal_name,
                research_organization_name:
                    recipient.research_organization_name,
                city: recipient.city || "",
                province: recipient.province || "",
                country: recipient.country || "",
                amendments_history: sortedGrants as any,
            };
        });
    }, [recipient.grants]);

    // Create corrected analytics data that only counts final amendment values
    const correctedAnalyticsData = useMemo(() => {
        // For funding by year
        const fundingByYear = processedGrants.reduce((acc, grant) => {
            const year = new Date(grant.agreement_start_date).getFullYear();
            if (!acc[year]) {
                acc[year] = { year };
            }
            acc[year][grant.org] =
                (acc[year][grant.org] || 0) + grant.agreement_value;
            return acc;
        }, {} as Record<number, any>);

        // For grant counts by year
        const grantsByYear = processedGrants.reduce((acc, grant) => {
            const year = new Date(grant.agreement_start_date).getFullYear();
            if (!acc[year]) {
                acc[year] = { year };
            }
            acc[year][grant.org] = (acc[year][grant.org] || 0) + 1;
            return acc;
        }, {} as Record<number, any>);

        return {
            fundingByYear: Object.values(fundingByYear).sort(
                (a, b) => a.year - b.year
            ),
            grantsByYear: Object.values(grantsByYear).sort(
                (a, b) => a.year - b.year
            ),
        };
    }, [processedGrants]);

    const toggleSort = (field: GrantSortConfig["field"]) => {
        setSortConfig((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    // Get all agencies from funding history for legend
    const agencies = Array.from(
        new Set(
            recipient.funding_history.flatMap((entry) =>
                Object.keys(entry).filter((key) => key !== "year")
            )
        )
    );

    // Calculate more advanced stats for the profile overview using processed grants
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

    // Define tabs for the TabNavigation component
    const tabs = [
        {
            id: "grants",
            label: "Grants",
            icon: BookMarked,
            count: uniqueGrantCount,
        },
        { id: "analytics", label: "Analytics", icon: LineChart },
    ];

    return (
        <div className="max-w-7xl mx-auto p-1 lg:p-6 space-y-6">
            {/* Header with profile and quick stats */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                {/* Top section with name, org, location */}
                <RecipientHeader
                    recipient={recipient}
                    isBookmarked={isBookmarked}
                    toggleBookmark={() => setIsBookmarked(!isBookmarked)}
                />

                {/* Key stats highlight */}
                <RecipientStats
                    recipient={recipient}
                    processedGrants={processedGrants}
                    agencies={agencies}
                    expandedStats={expandedStats}
                    setExpandedStats={setExpandedStats}
                />
            </div>

            {/* Tabs for page content */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                {/* Tab navigation */}
                <div className="border-b border-gray-200">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={(tabId) =>
                            setActiveTab(tabId as ProfileTab)
                        }
                    />
                </div>

                {/* Tab content */}
                <div className="p-6">
                    {/* Grants Tab */}
                    {activeTab === "grants" && (
                        <GrantsList
                            grants={processedGrants}
                            sortConfig={sortConfig}
                            toggleSort={toggleSort}
                        />
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <RecipientAnalytics
                            analyticsData={correctedAnalyticsData}
                            chartType={chartType}
                            setChartType={setChartType}
                            chartMetric={chartMetric}
                            setChartMetric={setChartMetric}
                            processedGrants={processedGrants}
                            agencies={agencies}
                            totalFunding={totalFunding}
                            totalYears={totalYears}
                            averagePerYear={averagePerYear}
                            uniqueGrantCount={uniqueGrantCount}
                            averageGrantValue={averageGrantValue}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipientProfilePage;
