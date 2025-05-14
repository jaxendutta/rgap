// src/pages/TrendsPage.tsx
import { useState, useMemo } from "react";
import {
    Calendar,
    DollarSign,
    Landmark,
    Sliders,
    MapPin,
    Layers,
    BookMarked,
    Info,
    TrendingUp,
    Pyramid,
    History,
} from "lucide-react";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import PageContainer from "@/components/common/layout/PageContainer";
import PageHeader from "@/components/common/layout/PageHeader";
import { TrendVisualizer } from "@/components/features/visualizations/TrendVisualizer";
import { MultiSelect } from "@/components/common/ui/MultiSelect";
import { useFilterOptions } from "@/hooks/api/useFilterOptions";
import { useAllGrantSearch } from "@/hooks/api/useData";
import { DateRangeFilter } from "@/components/features/filter/DateRangeFilter";
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
import { AGENCY_COLORS } from "@/utils/chartColors";
import { GrantSearchParams } from "@/types/search";
import { Grant } from "@/types/models";
import EmptyState from "@/components/common/ui/EmptyState";
import StatDisplay from "@/components/features/analytics/StatDisplay";
import { AnimatePresence, motion } from "framer-motion";
import { TimePeriodAnalytics } from "@/components/features/analytics/EntityAnalytics";

// Initial date range defaults
const getDefaultDateRange = () => {
    const today = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    return { from: fiveYearsAgo, to: today };
};

export default function TrendsPage() {
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [dateRange, setDateRange] = useState(getDefaultDateRange());
    const [expandedStats, setExpandedStats] = useState(false);

    // State for filters
    const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
    const [selectedCities, setSelectedCities] = useState<string[]>([]);

    // Get filter options
    const { data: filterOptions, isLoading: isLoadingFilters } =
        useFilterOptions();

    // Construct search parameters with current filters
    const searchParams: GrantSearchParams = useMemo(
        () => ({
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
                cities: selectedCities,
            },
            sortConfig: {
                field: "agreement_start_date",
                direction: "desc",
            },
        }),
        [
            dateRange,
            selectedAgencies,
            selectedCountries,
            selectedProvinces,
            selectedCities,
        ]
    );

    // Use the grant search hook with our search parameters
    const grantsQuery = useAllGrantSearch(searchParams, {
        enabled: true,
    });

    // Determine overall loading and error state
    const isLoading = isLoadingFilters || grantsQuery.isLoading;
    const isError = grantsQuery.isError;
    const error = grantsQuery.error;

    // Extract grants from search results
    const filteredGrants: Grant[] = grantsQuery.data?.data || [];

    // Calculate analytics from the filtered grants
    const fundingGrowth = useMemo(
        () => calculateFundingGrowth(filteredGrants),
        [filteredGrants]
    );

    const agencyAnalysis = useMemo(
        () => calculateAgencySpecialization(filteredGrants),
        [filteredGrants]
    );

    const grantDuration = useMemo(
        () => calculateAvgGrantDuration(filteredGrants),
        [filteredGrants]
    );

    // Calculate totals
    const totalFunding = useMemo(
        () =>
            filteredGrants.reduce(
                (sum: number, grant: Grant) =>
                    sum + Number(grant.agreement_value),
                0
            ),
        [filteredGrants]
    );

    const totalGrants = filteredGrants.length;
    const avgGrantValue = totalGrants > 0 ? totalFunding / totalGrants : 0;

    // Calculate time periods for comparison
    const timeRangeDescription = useMemo(() => {
        const fromYear = dateRange.from.getFullYear();
        const toYear = dateRange.to.getFullYear();
        const span = toYear - fromYear + 1;

        if (span === 1) {
            return `${fromYear}`;
        } else {
            return `${fromYear} to ${toYear} (${span} years)`;
        }
    }, [dateRange]);

    // Function to reset all filters
    const resetFilters = () => {
        setDateRange(getDefaultDateRange());
        setSelectedAgencies([]);
        setSelectedCountries([]);
        setSelectedProvinces([]);
        setSelectedCities([]);
    };

    // Handle loading and error states
    if (isLoading) {
        return (
            <PageContainer>
                <PageHeader
                    title="Funding Trends & Analytics"
                    subtitle="Loading funding trends data..."
                />
                <LoadingState
                    title="Loading grant data trends for the last 5 years..."
                    message="Please wait while we fetch the data for visualization. You can adjust the filters once the data is loaded."
                    fullHeight
                    size="lg"
                />
            </PageContainer>
        );
    }

    if (isError) {
        return (
            <PageContainer>
                <PageHeader
                    title="Funding Trends & Analytics"
                    subtitle="An error occurred while loading data."
                />
                <ErrorState
                    title="Error Loading Data"
                    message={
                        error instanceof Error
                            ? error.message
                            : "Failed to load grant data."
                    }
                    variant="default"
                    size="lg"
                    onRetry={resetFilters}
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
                <EmptyState
                    title="No Data Available"
                    message="There is no grant data available that matches your filters. Try adjusting your filter criteria."
                    variant="default"
                    size="lg"
                    primaryAction={{
                        label: "Reset Filters",
                        onClick: resetFilters,
                        icon: Sliders,
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
                        className="py-2.5"
                        responsiveText="hideOnMobile"
                    >
                        {isFilterVisible ? "Hide Filters" : "Show Filters"}
                    </Button>

                    {/* Date Range */}
                    <DateRangeFilter
                        label="Time Period"
                        value={dateRange}
                        onChange={setDateRange}
                        className="p-0"
                    />
                </div>

                <AnimatePresence>
                    {isFilterVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {filterOptions && (
                                        <>
                                            <MultiSelect
                                                icon={Landmark}
                                                label="Agencies"
                                                options={
                                                    filterOptions.agencies || []
                                                }
                                                values={selectedAgencies}
                                                onChange={setSelectedAgencies}
                                            />

                                            <MultiSelect
                                                icon={MapPin}
                                                label="Countries"
                                                options={
                                                    filterOptions.countries ||
                                                    []
                                                }
                                                values={selectedCountries}
                                                onChange={setSelectedCountries}
                                            />

                                            <MultiSelect
                                                icon={MapPin}
                                                label="Provinces"
                                                options={
                                                    filterOptions.provinces ||
                                                    []
                                                }
                                                values={selectedProvinces}
                                                onChange={setSelectedProvinces}
                                            />
                                        </>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Active Filters Display */}
                {(selectedAgencies.length > 0 ||
                    selectedCountries.length > 0 ||
                    selectedProvinces.length > 0 ||
                    selectedCities.length > 0) && (
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
                                    text={agency}
                                />
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
                                    text={country}
                                />
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
                                    text={province}
                                />
                            ))}

                            {selectedCities.map((city) => (
                                <Tag
                                    key={`city-${city}`}
                                    icon={MapPin}
                                    variant="outline"
                                    onRemove={() =>
                                        setSelectedCities(
                                            selectedCities.filter(
                                                (c) => c !== city
                                            )
                                        )
                                    }
                                    text={city}
                                />
                            ))}

                            {/* Clear All Button */}
                            <Tag
                                variant="ghost"
                                onRemove={resetFilters}
                                className="ml-auto cursor-pointer hover:bg-gray-100"
                                text={"Clear All"}
                            />
                        </Tags>
                    </div>
                )}
            </div>

            {/* Key Metrics */}
            <Card className="mb-6 overflow-hidden">
                <Card.Header
                    title="Overview"
                    icon={Pyramid}
                    subtitle={`${timeRangeDescription}`}
                />
                <Card.Content noPadding className="group">
                    {/* Primary Stats */}
                    <StatDisplay
                        items={[
                            {
                                icon: DollarSign,
                                label: "Total Funding",
                                value: formatCurrency(totalFunding),
                            },
                            {
                                icon: BookMarked,
                                label: "Total Grants",
                                value: totalGrants.toLocaleString(),
                            },
                            {
                                icon: Calendar,
                                label: "Avg Duration",
                                value: grantDuration.text,
                            },
                            {
                                icon: Layers,
                                label: "Avg Grant Value",
                                value: formatCurrency(avgGrantValue),
                            },
                        ]}
                        expandableItems={[
                            {
                                icon: TrendingUp,
                                label: "Funding Growth",
                                value: `${
                                    fundingGrowth.percentChange > 0 ? "+" : ""
                                }${fundingGrowth.percentChange.toFixed(1)}%`,
                                trend:
                                    fundingGrowth.percentChange > 0
                                        ? "up"
                                        : fundingGrowth.percentChange < 0
                                        ? "down"
                                        : "neutral",
                                secondaryText: `over ${fundingGrowth.yearsSpan} years`,
                            },
                            {
                                icon: Landmark,
                                label: "Agency Distribution",
                                value: agencyAnalysis.specialization,
                                secondaryText: agencyAnalysis.topAgency
                                    ? `${
                                          agencyAnalysis.topAgency
                                      }: ${agencyAnalysis.topPercentage.toFixed(
                                          1
                                      )}% of funding`
                                    : "No agency data",
                            },
                            {
                                icon: Calendar,
                                label: "Time Period Distribution",
                                value: `${dateRange.from.getFullYear()} - ${dateRange.to.getFullYear()}`,
                                secondaryText: `${totalGrants.toLocaleString()} grants analyzed`,
                            },
                        ]}
                        layout="grid"
                        columns={4}
                        size="md"
                        expandable={true}
                        expanded={expandedStats}
                        onToggleExpand={() => setExpandedStats(!expandedStats)}
                    />
                </Card.Content>
            </Card>

            {/* Main Visualization */}
            <TrendVisualizer
                grants={filteredGrants}
                height={500}
                showControls={true}
            />

            {/* Detailed Analysis Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Agency Breakdown */}
                <Card className="overflow-hidden">
                    <Card.Header title="Funding by Agency" icon={Landmark} />
                    <Card.Content>
                        <div className="space-y-4">
                            {agencyAnalysis.agencyData
                                .slice(0, 5)
                                .map(({ agency, funding, percentage }) => (
                                    <div key={agency} className="flex flex-col">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium">
                                                {agency}
                                            </span>
                                            <span>
                                                {formatCurrency(funding)}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor:
                                                        AGENCY_COLORS[agency] ||
                                                        "blue",
                                                }}
                                            ></div>
                                        </div>
                                        <div className="text-right text-xs text-gray-500 mt-1">
                                            {percentage.toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </Card.Content>
                </Card>

                {/* Funding by Year */}
                <TrendVisualizer
                    grants={filteredGrants}
                    viewContext="custom"
                    height={300}
                    initialChartType="line"
                    initialGrouping="year"
                    showControls={false}
                    title="Funding Over Time"
                    icon={History}
                />
            </div>

            {/* Time Period Analysis */}
            <TimePeriodAnalytics grants={filteredGrants} />

            {/* Bottom Information Card */}
            <Card className="my-6">
                <Card.Header title="About This Dashboard" icon={Info} />

                <Card.Content>
                    <div className="text-sm text-gray-600 space-y-4 lg:space-y-2">
                        <p>
                            This dashboard provides a comprehensive view of
                            research grant funding data. You can analyze trends
                            by time period, funding agency, geographic location,
                            and more using the filters and visualizations above.
                        </p>
                        <p>
                            Use the filters at the top to narrow down the data
                            set, and adjust the visualization settings to
                            explore different dimensions of the data.
                        </p>
                    </div>
                </Card.Content>
            </Card>
        </PageContainer>
    );
}
