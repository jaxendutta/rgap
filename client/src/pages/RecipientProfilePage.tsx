// src/pages/RecipientProfilePage.tsx
import { useState, useMemo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookMarked, LineChart } from "lucide-react";
import { useRecipientDetails } from "@/hooks/api/useRecipients";
import {
    GrantSortConfig,
    ChartType,
    ProfileTab,
    ChartMetric,
} from "@/types/search";
import { ResearchGrant } from "@/types/models";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import RecipientHeader from "@/components/features/recipients/RecipientHeader";
import RecipientStats from "@/components/features/recipients/RecipientStats";
import GrantsList from "@/components/features/grants/GrantsList";
import RecipientAnalytics from "@/components/features/recipients/RecipientAnalytics";
import { transformGrantsToYearlyData } from "@/utils/chartDataTransforms";

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
    const [sortConfig, setSortConfig] = useState<GrantSortConfig>({
        field: "date",
        direction: "desc",
    });
    const [chartType, setChartType] = useState<ChartType>("bar");
    const [chartMetric, setChartMetric] = useState<ChartMetric>("funding");
    const [activeTab, setActiveTab] = useState<ProfileTab>("grants");

    // If recipient not found and not loading
    if (!isLoading && !recipient && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Process grants to group by reference number and keep only the latest amendment
    const processedGrants = useMemo(() => {
        if (!recipient?.grants) return [];

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
    }, [recipient?.grants]);

    // Create corrected analytics data that only counts final amendment values
    const chartData = useMemo(() => {
        const fundingData = transformGrantsToYearlyData(
            processedGrants,
            "funding"
        );
        const countsData = transformGrantsToYearlyData(
            processedGrants,
            "counts"
        );

        return {
            fundingByYear: fundingData,
            grantsByYear: countsData,
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
    const agencies = useMemo(() => {
        if (!recipient?.funding_history) return [];
        return Array.from(
            new Set(
                recipient.funding_history.flatMap((entry) =>
                    Object.keys(entry).filter((key) => key !== "year")
                )
            )
        );
    }, [recipient?.funding_history]);

    // Calculate more advanced stats for the profile overview using processed grants
    const uniqueGrantCount = processedGrants.length;
    const totalFunding = processedGrants.reduce(
        (sum, grant) => sum + grant.agreement_value,
        0
    );
    const totalYears =
        recipient?.latest_grant_date && recipient?.first_grant_date
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
        },
        {
            id: "analytics",
            label: "Analytics",
            icon: LineChart,
        },
    ];

    // Render functions for EntityProfilePage
    const renderHeader = (
        isBookmarked: boolean,
        toggleBookmark: () => void
    ) => {
        if (!recipient) return null;
        return (
            <RecipientHeader
                recipient={recipient}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
            />
        );
    };

    const renderStats = (
        expandedStats: boolean,
        setExpandedStats: (value: boolean) => void
    ) => {
        if (!recipient) return null;
        return (
            <RecipientStats
                recipient={recipient}
                processedGrants={processedGrants}
                agencies={agencies}
                expandedStats={expandedStats}
                setExpandedStats={setExpandedStats}
            />
        );
    };

    const renderTabContent = (activeTabId: string) => {
        if (!recipient) return null;

        switch (activeTabId) {
            case "grants":
                return (
                    <GrantsList
                        grants={processedGrants}
                        sortConfig={sortConfig}
                        toggleSort={toggleSort}
                    />
                );
            case "analytics":
                return (
                    <RecipientAnalytics
                        analyticsData={chartData}
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
                );
            default:
                return null;
        }
    };

    return (
        <EntityProfilePage
            entity={recipient}
            entityType="recipient"
            entityTypeLabel="Recipient"
            isLoading={isLoading}
            isError={isError}
            error={error}
            renderHeader={renderHeader}
            renderStats={renderStats}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as ProfileTab)}
            renderTabContent={renderTabContent}
            chartType={chartType}
            setChartType={setChartType}
            chartMetric={chartMetric}
            setChartMetric={setChartMetric}
        />
    );
};

export default RecipientProfilePage;
