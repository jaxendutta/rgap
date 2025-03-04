// src/pages/InstituteProfilePage.tsx
import { useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
    BookmarkPlus,
    BookmarkCheck,
    MapPin,
    University,
    BookMarked,
    DollarSign,
    Users,
    GraduationCap,
    Calendar,
    LineChart,
} from "lucide-react";
import { EntityProfilePage } from "@/components/common/pages/EntityProfilePage";
import { formatCurrency, formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import { ChartType, ProfileTab } from "@/types/search";

// Import for demo purposes - in a real implementation, you would use an API hook
import { mock_data, mockInstitutes } from "../test-data/mockdata";

const InstituteProfilePage = () => {
    const { id } = useParams();

    // In a real implementation, this would be a data fetching hook similar to useRecipientDetails
    const institute = useMemo(() => {
        return mockInstitutes.find((institute) => institute.id === Number(id));
    }, [id]);

    // Simulate loading and error states for demo purposes
    const isLoading = false;
    const isError = false;
    const error = null;

    // Mock data fetching for grants and recipients
    const grants = useMemo(() => {
        if (!institute) return [];
        return institute.grants
            .map((grantId) =>
                mock_data.ResearchGrant.find(
                    (grant) => grant.grant_id === grantId
                )
            )
            .filter(Boolean);
    }, [institute]);

    const recipients = useMemo(() => {
        if (!institute) return [];
        return institute.recipients
            .map((recipientId) => {
                const recipient = mock_data.Recipient.find(
                    (recipient) => recipient.recipient_id === recipientId
                );
                return recipient
                    ? {
                          ...recipient,
                          grants: grants.filter(
                              (grant) =>
                                  grant &&
                                  grant.recipient_id === recipient.recipient_id
                          ),
                      }
                    : null;
            })
            .filter(Boolean);
    }, [institute, grants]);

    // Component state
    const [activeTab, setActiveTab] = useState<ProfileTab>("grants");
    const [sortConfig, setSortConfig] = useState({
        field: "date" as "date" | "value" | "grants_count",
        direction: "desc" as "asc" | "desc",
    });
    const [chartType, setChartType] = useState<ChartType>("line");

    // If institute not found and not loading
    if (!isLoading && !institute && !isError) {
        return <Navigate to="/pageNotFound" />;
    }

    const toggleSort = (field: "date" | "value" | "grants_count") => {
        setSortConfig((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    // Sort data based on current configuration
    const sortedGrants = useMemo(() => {
        if (!grants.length) return [];

        return [...grants].sort((a, b) =>
            sortConfig.field === "value"
                ? sortConfig.direction === "asc"
                    ? (a?.agreement_value ?? 0) - (b?.agreement_value ?? 0)
                    : (b?.agreement_value ?? 0) - (a?.agreement_value ?? 0)
                : sortConfig.direction === "asc"
                ? (new Date(a?.agreement_start_date ?? 0).getTime()) -
                  (new Date(b?.agreement_start_date ?? 0).getTime())
                : (new Date(b?.agreement_start_date ?? 0).getTime()) -
                  (new Date(a?.agreement_start_date ?? 0).getTime())
        );
    }, [grants, sortConfig]);

    const sortedRecipients = useMemo(() => {
        if (!recipients.length) return [];

        return [...recipients].sort((a, b) =>
            sortConfig.field === "value"
                ? sortConfig.direction === "asc"
                    ? (a?.grants.reduce((sum, g) => sum + (g?.agreement_value ?? 0), 0) ?? 0) -
                      (b?.grants.reduce((sum, g) => sum + (g?.agreement_value ?? 0), 0) ?? 0)
                    : (b?.grants.reduce((sum, g) => sum + (g?.agreement_value ?? 0), 0) ?? 0) -
                      (a?.grants.reduce((sum, g) => sum + (g?.agreement_value ?? 0), 0) ?? 0)
                : sortConfig.field === "grants_count"
                ? sortConfig.direction === "asc"
                    ? (a?.grants.length ?? 0) - (b?.grants.length ?? 0)
                    : (b?.grants.length ?? 0) - (a?.grants.length ?? 0)
                : 0
        );
    }, [recipients, sortConfig]);

    // Define tabs for the institute profile
    const tabs = [
        { id: "grants", label: "Grants", icon: BookMarked },
        { id: "recipients", label: "Recipients", icon: GraduationCap },
        { id: "analytics", label: "Analytics", icon: LineChart },
    ];

    // Render functions for EntityProfilePage
    const renderHeader = (
        isBookmarked: boolean,
        toggleBookmark: () => void
    ) => {
        if (!institute) return null;

        return (
            <div className="p-4 lg:p-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">
                            {institute.name}
                        </h1>
                        <div className="flex items-center text-gray-600">
                            <University className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{institute.type}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>
                                {institute.city}, {institute.province}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={toggleBookmark}
                        className={cn(
                            "p-2 h-fit rounded-full transition-colors hover:bg-gray-50",
                            isBookmarked
                                ? "text-blue-600 hover:text-blue-700"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        {isBookmarked ? (
                            <BookmarkCheck className="h-5 w-5" />
                        ) : (
                            <BookmarkPlus className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        );
    };

    const renderStats = () => {
        if (!institute) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 lg:p-6 pt-2 bg-gray-50">
                <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2">
                        <BookMarked className="h-4 w-4 mr-2" />
                        <span>Grants</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-2xl font-semibold">
                            {institute.stats.total_grants.value}
                        </span>
                        {institute.stats.total_grants.trend && (
                            <span className="ml-2 text-sm text-green-500">
                                {institute.stats.total_grants.trend === "up"
                                    ? "↑"
                                    : "↓"}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>Total Funding</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-2xl font-semibold">
                            {formatCurrency(institute.stats.total_value.value)}
                        </span>
                        {institute.stats.total_value.trend && (
                            <span className="ml-2 text-sm text-green-500">
                                {institute.stats.total_value.trend === "up"
                                    ? "↑"
                                    : "↓"}
                            </span>
                        )}
                    </div>
                </div>

                <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex items-center text-gray-600 mb-2">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Recipients</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-2xl font-semibold">
                            {institute.stats.recipients.value}
                        </span>
                        {institute.stats.recipients.trend && (
                            <span className="ml-2 text-sm text-green-500">
                                {institute.stats.recipients.trend === "up"
                                    ? "↑"
                                    : "↓"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderTabContent = (activeTabId: string) => {
        if (!institute) return null;

        switch (activeTabId) {
            case "grants":
                return (
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-medium text-gray-900">
                                All Grants
                            </h3>
                            <div className="flex">
                                <button
                                    onClick={() => toggleSort("date")}
                                    className={`px-3 py-1.5 text-sm ${
                                        sortConfig.field === "date"
                                            ? "bg-gray-100 font-medium"
                                            : "bg-white"
                                    } rounded-l-md border`}
                                >
                                    Date{" "}
                                    {sortConfig.field === "date" &&
                                        (sortConfig.direction === "asc"
                                            ? "↑"
                                            : "↓")}
                                </button>
                                <button
                                    onClick={() => toggleSort("value")}
                                    className={`px-3 py-1.5 text-sm ${
                                        sortConfig.field === "value"
                                            ? "bg-gray-100 font-medium"
                                            : "bg-white"
                                    } rounded-r-md border-t border-r border-b`}
                                >
                                    Value{" "}
                                    {sortConfig.field === "value" &&
                                        (sortConfig.direction === "asc"
                                            ? "↑"
                                            : "↓")}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y">
                            {sortedGrants.map(
                                (grant) =>
                                    grant && (
                                        <div
                                            key={grant.grant_id}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <div className="text-lg font-medium">
                                                        {
                                                            grant.agreement_title_en
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-600 flex items-center">
                                                        <GraduationCap className="h-4 w-4 mr-1" />
                                                        {recipients.find(
                                                            (r) =>
                                                                r?.recipient_id ===
                                                                grant.recipient_id
                                                        )?.legal_name ||
                                                            "Unknown Recipient"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {grant.ref_number} •{" "}
                                                        {grant.org}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium">
                                                        {formatCurrency(
                                                            grant.agreement_value
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        <div className="flex items-center justify-end">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            <span>
                                                                {formatDate(
                                                                    grant.agreement_start_date
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                );

            case "recipients":
                return (
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-medium text-gray-900">
                                All Recipients
                            </h3>
                            <div className="flex">
                                <button
                                    onClick={() => toggleSort("grants_count")}
                                    className={`px-3 py-1.5 text-sm ${
                                        sortConfig.field === "grants_count"
                                            ? "bg-gray-100 font-medium"
                                            : "bg-white"
                                    } rounded-l-md border`}
                                >
                                    Grants{" "}
                                    {sortConfig.field === "grants_count" &&
                                        (sortConfig.direction === "asc"
                                            ? "↑"
                                            : "↓")}
                                </button>
                                <button
                                    onClick={() => toggleSort("value")}
                                    className={`px-3 py-1.5 text-sm ${
                                        sortConfig.field === "value"
                                            ? "bg-gray-100 font-medium"
                                            : "bg-white"
                                    } rounded-r-md border-t border-r border-b`}
                                >
                                    Value{" "}
                                    {sortConfig.field === "value" &&
                                        (sortConfig.direction === "asc"
                                            ? "↑"
                                            : "↓")}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y">
                            {sortedRecipients.map(
                                (recipient) =>
                                    recipient && (
                                        <div
                                            key={recipient.recipient_id}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <Link
                                                        to={`/recipients/${recipient.recipient_id}`}
                                                        className="text-lg font-medium hover:text-blue-600 transition-colors flex items-center"
                                                    >
                                                        <GraduationCap className="h-4 w-4 mr-1" />
                                                        {recipient.legal_name}
                                                    </Link>
                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            recipient.grants
                                                                .length
                                                        }{" "}
                                                        Grants
                                                    </div>
                                                </div>
                                                <div className="font-medium text-right">
                                                    {formatCurrency(
                                                        recipient.grants.reduce(
                                                            (acc, grant) =>
                                                                grant
                                                                    ? acc +
                                                                      grant.agreement_value
                                                                    : acc,
                                                            0
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                );

            case "analytics":
                return (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-900">
                                Funding History
                            </h3>
                            <div className="flex">
                                <button
                                    onClick={() => setChartType("line")}
                                    className={`px-3 py-1.5 text-sm ${
                                        chartType === "line"
                                            ? "bg-gray-100 font-medium"
                                            : "bg-white"
                                    } rounded-l-md border`}
                                >
                                    Line Chart
                                </button>
                                <button
                                    onClick={() => setChartType("bar")}
                                    className={`px-3 py-1.5 text-sm ${
                                        chartType === "bar"
                                            ? "bg-gray-100 font-medium"
                                            : "bg-white"
                                    } rounded-r-md border-t border-r border-b`}
                                >
                                    Bar Chart
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border rounded-lg p-4 h-64 flex items-center justify-center">
                            <p className="text-gray-500">
                                {chartType === "line" ? "Line" : "Bar"} chart
                                visualization would appear here
                            </p>
                            {/* In a real implementation, you would render a LineChart or BarChart component here */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            {/* Sample analytics cards */}
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium mb-2">
                                    Funding by Agency
                                </h4>
                                <p className="text-gray-500 text-sm">
                                    Funding breakdown visualization
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium mb-2">
                                    Top Recipients
                                </h4>
                                <p className="text-gray-500 text-sm">
                                    List of top grant recipients
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium mb-2">
                                    Annual Trends
                                </h4>
                                <p className="text-gray-500 text-sm">
                                    Year-over-year funding trends
                                </p>
                            </div>
                        </div>
                    </div>
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
        />
    );
};

export default InstituteProfilePage;
