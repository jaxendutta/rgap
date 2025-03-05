// src/pages/InstituteProfilePage.tsx
import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { BookMarked, LineChart, GraduationCap } from "lucide-react";
import { useInstituteDetails } from "@/hooks/api/useInstitutes";
import { useInfiniteInstituteGrants } from "@/hooks/api/useInfiniteInstituteData";
import { ChartType, ProfileTab, ChartMetric } from "@/types/search";
import EntityProfilePage from "@/components/common/pages/EntityProfilePage";
import InstituteHeader from "@/components/features/institutes/InstituteHeader";
import InstituteStats from "@/components/features/institutes/InstituteStats";
import InstituteAnalytics from "@/components/features/institutes/InstituteAnalytics";
import { RecipientsList } from "@/components/features/recipients/RecipientsList";
import GrantsList, {
    SortConfig,
} from "@/components/features/grants/GrantsList";

const InstituteProfilePage = () => {
    const { id } = useParams();

    // Component state
    const [chartType, setChartType] = useState<ChartType>("bar");
    const [chartMetric, setChartMetric] = useState<ChartMetric>("funding");
    const [activeTab, setActiveTab] = useState<ProfileTab>("recipients");
    const [expandedStats, setExpandedStats] = useState(false);
    const [grantsSortConfig] = useState<SortConfig>({
        field: "date",
        direction: "desc",
    });

    // Use the API hook to fetch institute basic details
    const {
        data: instituteData,
        isLoading,
        isError,
        error,
    } = useInstituteDetails(id || "");

    // Set up infinite query for grants with sorting
    const infiniteGrantsQuery = useInfiniteInstituteGrants(
        id || "",
        15, // pageSize
        grantsSortConfig.field,
        grantsSortConfig.direction
    );

    const institute = instituteData?.data;

    // If institute not found and not loading
    if (!isLoading && !institute && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    // Get all agencies from funding history for legend and charts
    const agencies = institute?.funding_history
        ? Array.from(
              new Set(
                  institute.funding_history.flatMap((entry: any) =>
                      Object.keys(entry).filter((key) => key !== "year")
                  )
              )
          )
        : [];

    // Define tabs for the TabNavigation component
    const tabs = [
        {
            id: "recipients",
            label: "Recipients",
            icon: GraduationCap,
        },
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
        if (!institute) return null;
        return (
            <InstituteHeader
                institute={institute}
                isBookmarked={isBookmarked}
                toggleBookmark={toggleBookmark}
            />
        );
    };

    const renderStats = () => {
        if (!institute) return null;
        return (
            <InstituteStats
                institute={institute}
                processedGrants={institute.grants || []}
                recipients={institute.recipients || []}
                agencies={agencies}
                expandedStats={expandedStats}
                setExpandedStats={setExpandedStats}
            />
        );
    };

    const renderTabContent = (activeTabId: string) => {
        if (!institute) return null;

        switch (activeTabId) {
            case "recipients":
                return (
                    <RecipientsList
                        instituteId={id || ""}
                        initialPageSize={15}
                    />
                );

            case "grants":
                return (
                    <GrantsList
                        infiniteQuery={infiniteGrantsQuery}
                        title="Grants"
                        initialSortConfig={grantsSortConfig}
                        contextData={{
                            instituteName: institute.name,
                            instituteId: id,
                            city: institute.city,
                            province: institute.province,
                            country: institute.country,
                        }}
                        emptyMessage="This institute has no associated grants in our database."
                    />
                );

            case "analytics":
                return (
                    <InstituteAnalytics
                        analyticsData={{
                            fundingByYear: institute.funding_history || [],
                            grantsByYear: [], // We'll need to compute this if needed
                        }}
                        chartType={chartType}
                        setChartType={setChartType}
                        chartMetric={chartMetric}
                        setChartMetric={setChartMetric}
                        processedGrants={institute.grants || []}
                        recipients={institute.recipients || []}
                        agencies={agencies}
                        totalFunding={institute.total_funding || 0}
                        totalYears={
                            institute.latest_grant_date &&
                            institute.first_grant_date
                                ? new Date(
                                      institute.latest_grant_date
                                  ).getFullYear() -
                                  new Date(
                                      institute.first_grant_date
                                  ).getFullYear() +
                                  1
                                : 0
                        }
                        averagePerYear={
                            institute.total_funding &&
                            institute.latest_grant_date &&
                            institute.first_grant_date
                                ? institute.total_funding /
                                  (new Date(
                                      institute.latest_grant_date
                                  ).getFullYear() -
                                      new Date(
                                          institute.first_grant_date
                                      ).getFullYear() +
                                      1)
                                : 0
                        }
                        uniqueGrantCount={institute.total_grants || 0}
                        uniqueRecipientCount={institute.total_recipients || 0}
                        averageGrantValue={
                            institute.total_funding && institute.total_grants
                                ? institute.total_funding /
                                  institute.total_grants
                                : 0
                        }
                    />
                );

            default:
                return null;
        }
    };

    return (
        <EntityProfilePage
            entity={institute}
            entityType="institute"
            entityTypeLabel="Institute"
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

export default InstituteProfilePage;
