// src/pages/RecipientProfilePage.tsx
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookMarked, LineChart } from "lucide-react";
import { useRecipientDetails } from "@/hooks/api/useRecipients";
import { ChartType, ProfileTab, ChartMetric } from "@/types/search";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import RecipientHeader from "@/components/features/recipients/RecipientHeader";
import RecipientStats from "@/components/features/recipients/RecipientStats";
import RecipientAnalytics from "@/components/features/recipients/RecipientAnalytics";
import GrantsList, {
    SortConfig,
} from "@/components/features/grants/GrantsList";
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
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "date",
        direction: "desc",
    });
    const [chartType, setChartType] = useState<ChartType>("bar");
    const [chartMetric, setChartMetric] = useState<ChartMetric>("funding");
    const [activeTab, setActiveTab] = useState<ProfileTab>("grants");
    const [expandedStats, setExpandedStats] = useState(false);

    // If recipient not found and not loading
    if (!isLoading && !recipient && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Create analytics data
    const analyticsData = recipient
        ? {
              fundingByYear: transformGrantsToYearlyData(
                  recipient.grants || [],
                  "funding"
              ),
              grantsByYear: transformGrantsToYearlyData(
                  recipient.grants || [],
                  "counts"
              ),
          }
        : { fundingByYear: [], grantsByYear: [] };

    // Get all agencies from funding history for legend
    const agencies = recipient?.funding_history
        ? Array.from(
              new Set(
                  recipient.funding_history.flatMap((entry: any) =>
                      Object.keys(entry).filter((key) => key !== "year")
                  )
              )
          )
        : [];

    // Calculate stats for the profile overview
    const uniqueGrantCount = recipient?.grants?.length || 0;
    const totalFunding = recipient?.total_funding || 0;
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

    const renderStats = () => {
        if (!recipient) return null;
        return (
            <RecipientStats
                recipient={recipient}
                processedGrants={recipient.grants || []}
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
                        grants={recipient.grants || []}
                        onSortChange={setSortConfig}
                        initialSortConfig={sortConfig}
                        title="Grants"
                        contextData={{
                            recipientName: recipient.legal_name,
                            recipientId: recipient.recipient_id,
                            instituteName: recipient.research_organization_name,
                            instituteId: recipient.institute_id,
                        }}
                        emptyMessage="This recipient has no associated grants in our database."
                    />
                );
            case "analytics":
                return (
                    <RecipientAnalytics
                        analyticsData={analyticsData}
                        chartType={chartType}
                        setChartType={setChartType}
                        chartMetric={chartMetric}
                        setChartMetric={setChartMetric}
                        processedGrants={recipient.grants || []}
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
