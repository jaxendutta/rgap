// src/pages/TrendsPage.tsx
import { useState } from "react";
import {
    LineChart,
    BarChartIcon,
    Calendar,
    DollarSign,
    Landmark,
    PieChart,
    ArrowDown,
    ArrowUp,
    Sliders,
    MapPin,
    Layers,
    Hash,
    BookMarked,
} from "lucide-react";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import { MultiSelect } from "@/components/common/ui/MultiSelect";
import { useFilterOptions } from "@/hooks/api/useFilterOptions";
import { useGrantSearch } from "@/hooks/api/useData";
import { DateRangeFilter } from "@/components/common/ui/DateRangeFilter";
import LoadingState from "@/components/common/ui/LoadingState";
import ErrorState from "@/components/common/ui/ErrorState";
import Tag, { Tags } from "@/components/common/ui/Tag";
import {
    calculateAgencySpecialization,
    calculateFundingGrowth,
    calculateAvgGrantDuration,
} from "@/utils/analytics";
import { formatCurrency } from "@/utils/format";
import { DEFAULT_FILTER_STATE } from "@/constants/filters";
import { cn } from "@/utils/cn";
import ToggleButtons from "@/components/common/ui/ToggleButtons";
import { GrantSearchParams } from "@/types/search";
import { Grant } from "@/types/models";
import { GroupingDimension } from "@/components/features/visualizations/TrendVisualizer";

// Initial date range defaults
const getDefaultDateRange = () => {
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    return { from: fiveYearsAgo, to: today };
};

export default function TrendsPage() {
    // State for visualization settings
    const [metricType, setMetricType] = useState<"funding" | "count">(
        "funding"
    );
    const [chartType, setChartType] = useState<"line" | "stacked" | "grouped">(
        "line"
    );
    const [groupBy, setGroupBy] = useState<GroupingDimension>("org");
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [dateRange, setDateRange] = useState(getDefaultDateRange());

    // State for filters
    const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);

    // Get filter options
    const { data: filterOptions, isLoading: isLoadingFilters } =
        useFilterOptions();

    // Construct search parameters with current filters
    const searchParams: GrantSearchParams = {
        searchTerms: {
            recipient: "",
            institute: "",
            grant: "",
        },
        filters: {
            ...DEFAULT_FILTER_STATE,
            dateRange: dateRange,
            agencies: selectedAgencies,
            countries: selectedCountries,
            provinces: selectedProvinces,
        },
        sortConfig: {
            field: "agreement_start_date",
            direction: "desc",
        },
    };

    // Use the grant search hook with our search parameters
    const {
        data: searchData,
        isLoading: isLoadingGrants,
        isError: isErrorGrants,
        error: errorGrants,
    } = useGrantSearch(searchParams, {
        queryType: "complete",
        enabled: true,
    });

    // Extract grants from search results
    const filteredGrants = searchData?.data || [];

    // Calculate analytics
    const fundingGrowth = calculateFundingGrowth(filteredGrants);
    const agencyAnalysis = calculateAgencySpecialization(filteredGrants);
    const grantDuration = calculateAvgGrantDuration(filteredGrants);

    // Calculate totals
    const totalFunding = filteredGrants.reduce(
        (sum: number, grant: Grant) => sum + Number(grant.agreement_value),
        0
    );
    const totalGrants = filteredGrants.length;
    const avgGrantValue = totalGrants > 0 ? totalFunding / totalGrants : 0;

    // Define grouping options
    const groupingOptions = [
        { value: "org", label: "Funding Agency" },
        { value: "country", label: "Country" },
        { value: "province", label: "Province/State" },
        { value: "recipient", label: "Recipient" },
        { value: "program", label: "Program" },
        { value: "year", label: "Year Only" },
    ];

    // Handle loading and error states
    if (isLoadingGrants || isLoadingFilters) {
        return (
            <PageContainer>
                <PageHeader
                    title="Funding Trends & Analytics"
                    subtitle="Loading funding trends data..."
                />
                <LoadingState
                    title="Loading grant data..."
                    message="Please wait while we fetch the data for visualization."
                    fullHeight
                    size="lg"
                />
            </PageContainer>
        );
    }

    if (isErrorGrants) {
        return (
            <PageContainer>
                <PageHeader
                    title="Funding Trends & Analytics"
                    subtitle="An error occurred while loading data."
                />
                <ErrorState
                    title="Error Loading Data"
                    message={
                        errorGrants instanceof Error
                            ? errorGrants.message
                            : "Failed to load grant data."
                    }
                    variant="default"
                    size="lg"
                    onRetry={() => {
                        // Reset filters
                        setDateRange(getDefaultDateRange());
                        setSelectedAgencies([]);
                        setSelectedCountries([]);
                        setSelectedProvinces([]);
                    }}
                />
            </PageContainer>
        );
    }

    if (!filteredGrants || filteredGrants.length === 0) {
        return (
            <PageContainer>
                <PageHeader
                    title="Funding Trends & Analytics"
                    subtitle="Visualize funding trends across all agencies and recipients."
                />
                <ErrorState
                    title="No Data Available"
                    message="There is no grant data available that matches your filters. Try adjusting your filter criteria."
                    variant="default"
                    size="lg"
                    onRetry={() => {
                        // Reset filters
                        setDateRange(getDefaultDateRange());
                        setSelectedAgencies([]);
                        setSelectedCountries([]);
                        setSelectedProvinces([]);
                    }}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Funding Trends & Analytics"
                subtitle="Visualize funding trends across all agencies and recipients."
            />

            {/* Filter Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <Button
                        variant="secondary"
                        leftIcon={Sliders}
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                        className="mb-4"
                    >
                        {isFilterVisible ? "Hide Filters" : "Show Filters"}
                    </Button>

                    {/* Date Range */}
                    <DateRangeFilter
                        label="Time Period"
                        value={dateRange}
                        onChange={setDateRange}
                    />
                </div>

                {isFilterVisible && (
                    <Card className="p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {filterOptions && (
                                <>
                                    <MultiSelect
                                        icon={Landmark}
                                        label="Agencies"
                                        options={filterOptions.agencies || []}
                                        values={selectedAgencies}
                                        onChange={setSelectedAgencies}
                                    />

                                    <MultiSelect
                                        icon={MapPin}
                                        label="Countries"
                                        options={filterOptions.countries || []}
                                        values={selectedCountries}
                                        onChange={setSelectedCountries}
                                    />

                                    <MultiSelect
                                        icon={MapPin}
                                        label="Provinces"
                                        options={filterOptions.provinces || []}
                                        values={selectedProvinces}
                                        onChange={setSelectedProvinces}
                                    />
                                </>
                            )}
                        </div>
                    </Card>
                )}

                {/* Active Filters Display */}
                {(selectedAgencies.length > 0 ||
                    selectedCountries.length > 0 ||
                    selectedProvinces.length > 0) && (
                    <div className="mb-4">
                        <Tags spacing="normal">
                            {selectedAgencies.map((agency) => (
                                <Tag
                                    key={`agency-${agency}`}
                                    icon={Landmark}
                                    variant="primary"
                                    onRemove={() =>
                                        setSelectedAgencies(
                                            selectedAgencies.filter(
                                                (a) => a !== agency
                                            )
                                        )
                                    }
                                >
                                    {agency}
                                </Tag>
                            ))}

                            {selectedCountries.map((country) => (
                                <Tag
                                    key={`country-${country}`}
                                    icon={MapPin}
                                    variant="secondary"
                                    onRemove={() =>
                                        setSelectedCountries(
                                            selectedCountries.filter(
                                                (c) => c !== country
                                            )
                                        )
                                    }
                                >
                                    {country}
                                </Tag>
                            ))}

                            {selectedProvinces.map((province) => (
                                <Tag
                                    key={`province-${province}`}
                                    icon={MapPin}
                                    variant="outline"
                                    onRemove={() =>
                                        setSelectedProvinces(
                                            selectedProvinces.filter(
                                                (p) => p !== province
                                            )
                                        )
                                    }
                                >
                                    {province}
                                </Tag>
                            ))}
                        </Tags>
                    </div>
                )}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <div className="flex items-center text-blue-600 text-sm mb-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Total Funding</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(totalFunding)}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center text-blue-600 text-sm mb-1">
                        <BookMarked className="h-4 w-4 mr-1" />
                        <span>Total Grants</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {totalGrants.toLocaleString()}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center text-blue-600 text-sm mb-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Avg Duration</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {grantDuration.text}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center text-blue-600 text-sm mb-1">
                        <Layers className="h-4 w-4 mr-1" />
                        <span>Avg Grant Value</span>
                    </div>
                    <div className="text-2xl font-bold">
                        {formatCurrency(avgGrantValue)}
                    </div>
                </Card>
            </div>

            {/* Funding Growth Indicator */}
            <Card className="mb-6 p-4">
                <h2 className="text-lg font-medium mb-4">
                    Funding Trend Analysis
                </h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Funding Growth
                            </h3>
                            <div className="flex items-center">
                                <span
                                    className={cn(
                                        "text-xl font-bold",
                                        fundingGrowth.percentChange > 0
                                            ? "text-green-600"
                                            : fundingGrowth.percentChange < 0
                                            ? "text-red-600"
                                            : "text-gray-900"
                                    )}
                                >
                                    {fundingGrowth.percentChange > 0 ? "+" : ""}
                                    {fundingGrowth.percentChange.toFixed(1)}%
                                </span>
                                {fundingGrowth.percentChange > 0 ? (
                                    <ArrowUp className="h-5 w-5 ml-2 text-green-500" />
                                ) : fundingGrowth.percentChange < 0 ? (
                                    <ArrowDown className="h-5 w-5 ml-2 text-red-500" />
                                ) : null}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                over {fundingGrowth.yearsSpan} years
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/3">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Agency Distribution
                            </h3>
                            <div className="text-xl font-bold">
                                {agencyAnalysis.specialization}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {agencyAnalysis.topAgency}:{" "}
                                {agencyAnalysis.topPercentage.toFixed(1)}% of
                                funding
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/3">
                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">
                                Time Period
                            </h3>
                            <div className="text-xl font-bold">
                                {dateRange.from.getFullYear()} -{" "}
                                {dateRange.to.getFullYear()}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {totalGrants.toLocaleString()} grants analyzed
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Visualization Controls */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
                <div className="flex gap-3 items-center">
                    <span className="text-sm font-medium text-gray-700">
                        Group By:
                    </span>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value as GroupingDimension)}
                        className="rounded-md border border-gray-300 shadow-sm px-3 py-1.5 text-sm"
                    >
                        {groupingOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex space-x-4 items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            Metric:
                        </span>
                        <ToggleButtons>
                            <Button
                                onClick={() => setMetricType("funding")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                    metricType === "funding"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <DollarSign className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">
                                    Funding
                                </span>
                            </Button>
                            <Button
                                onClick={() => setMetricType("count")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                    metricType === "count"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <Hash className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Count</span>
                            </Button>
                        </ToggleButtons>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            Chart:
                        </span>
                        <ToggleButtons>
                            <Button
                                onClick={() => setChartType("line")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                    chartType === "line"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <LineChart className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">Line</span>
                            </Button>
                            <Button
                                onClick={() => setChartType("stacked")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                    chartType === "stacked"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <BarChartIcon className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">
                                    Stacked
                                </span>
                            </Button>
                            <Button
                                onClick={() => setChartType("grouped")}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-medium border flex items-center gap-1",
                                    chartType === "grouped"
                                        ? "bg-gray-100 text-gray-800 border-gray-300"
                                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                                )}
                            >
                                <PieChart className="h-3.5 w-3.5" />
                                <span className="hidden md:inline">
                                    Grouped
                                </span>
                            </Button>
                        </ToggleButtons>
                    </div>
                </div>
            </div>

            {/* Main Visualization */}
            <Card className="p-4">
                <TrendVisualizer
                    grants={filteredGrants}
                    viewContext="custom"
                    height={500}
                    initialChartType={chartType}
                    initialMetricType={metricType}
                    initialGrouping={groupBy}
                    showControls={false}
                />
            </Card>

            {/* Agency Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Agency Breakdown */}
                <Card className="p-4">
                    <h2 className="text-lg font-medium mb-4 flex items-center">
                        <Landmark className="h-5 w-5 mr-2 text-blue-600" />
                        Funding by Agency
                    </h2>

                    <div className="space-y-4">
                        {agencyAnalysis.agencyData
                            .slice(0, 5)
                            .map(({ agency, funding, percentage }) => (
                                <div key={agency} className="flex flex-col">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium">
                                            {agency}
                                        </span>
                                        <span>{formatCurrency(funding)}</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-blue-600"
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 mt-1">
                                        {percentage.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>

                {/* Funding by Time Period */}
                <Card className="p-4">
                    <h2 className="text-lg font-medium mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        Funding Over Time
                    </h2>

                    <TrendVisualizer
                        grants={filteredGrants}
                        viewContext="custom"
                        height={300}
                        initialChartType="line"
                        initialMetricType={metricType}
                        initialGrouping="year"
                        showControls={false}
                    />
                </Card>
            </div>
        </PageContainer>
    );
}
