// src/components/visualizations/TrendVisualizer.tsx
'use client';

import React, { useState, useEffect, useMemo } from "react";
import {
    LuDollarSign, LuHash, LuChartColumnStacked, LuChartColumn,
    LuChartSpline, LuActivity, LuLandmark, LuGraduationCap,
    LuCalendar, LuBookOpen,
} from "react-icons/lu";
import { IconType } from "react-icons";
import { cn, formatDate } from "@/lib/utils";
import { GrantAmendment } from "@/types/database";
import { Card } from "@/components/ui/Card";
import { Dropdown } from "@/components/ui/Dropdown";
import DataChart from "@/components/visualizations/DataChart";
import { getCategoryColor } from "@/lib/chartColors";
import Button from "@/components/ui/Button";
import ToggleButtons from "@/components/ui/ToggleButtons";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { formatSentenceCase } from "@/lib/format";
import { getAggregatedTrends, AggregatedTrendPoint } from "@/app/actions/analytics";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import useResponsive from "@/lib/useResponsive";

export type ChartType = "line" | "stacked" | "grouped";
export type MetricType = "funding" | "count";
export type GroupingDimension = "org" | "city" | "province" | "country" | "recipient" | "institute" | "program" | "year" | "amendment";
export type ViewContext = "search" | "recipient" | "institute" | "custom";

interface TrendVisualizerProps {
    entityType?: 'recipient' | 'institute';
    ids?: number[];
    preLoadedData?: AggregatedTrendPoint[];
    amendmentsHistory?: GrantAmendment[];
    viewContext?: ViewContext;
    initialChartType?: ChartType;
    initialMetricType?: MetricType;
    initialGrouping?: GroupingDimension;
    availableGroupings?: GroupingDimension[];
    availableMetrics?: MetricType[];
    height?: number;
    className?: string;
    title?: string;
    icon?: IconType;
    showControls?: boolean;
}

const getGroupingIcon = (dimension: GroupingDimension): React.ElementType => {
    const iconMap: Record<GroupingDimension, React.ElementType> = {
        org: LuLandmark, city: LuGraduationCap, province: LuGraduationCap,
        country: LuGraduationCap, recipient: LuGraduationCap, institute: LuLandmark,
        program: LuBookOpen, year: LuCalendar, amendment: LuActivity,
    };
    return iconMap[dimension] || LuActivity;
};

const getDefaultGroupings = (viewContext: ViewContext): GroupingDimension[] => {
    switch (viewContext) {
        case "recipient": return ["org", "program", "year"];
        case "institute": return ["org", "program", "recipient", "year"];
        case "search": default: return ["org", "city", "province", "country", "recipient", "institute", "program"];
    }
};

export const TrendVisualizer: React.FC<TrendVisualizerProps> = ({
    entityType,
    ids = [],
    preLoadedData,
    amendmentsHistory,
    viewContext = "search",
    initialChartType = "line",
    initialMetricType = "funding",
    initialGrouping,
    availableGroupings: propsAvailableGroupings,
    availableMetrics = ["funding", "count"],
    height = 400,
    className,
    title = "Trend Visualizer",
    icon = LuActivity,
    showControls = true,
}) => {
    const screenSize = useResponsive();

    height = screenSize === "sm" ? 300 : screenSize === "md" ? 400 : 400;

    // --- 1. State & Stability ---
    const isAmendmentView = amendmentsHistory && amendmentsHistory.length > 0;

    const stableIdsKey = useMemo(() => {
        if (!ids || ids.length === 0) return "ALL";
        return [...ids].sort().join(',');
    }, [ids]);

    const effectiveAvailableGroupings = useMemo(() => {
        if (isAmendmentView) return ["amendment" as GroupingDimension];
        return propsAvailableGroupings || getDefaultGroupings(viewContext);
    }, [isAmendmentView, propsAvailableGroupings, viewContext]);

    // UI Config
    const [chartType, setChartType] = useState<ChartType>(initialChartType);
    const [metricType, setMetricType] = useState<MetricType>(initialMetricType);
    const [groupingDimension, setGroupingDimension] = useState<GroupingDimension>(
        initialGrouping || (effectiveAvailableGroupings[0] as GroupingDimension)
    );
    const [showOther, setShowOther] = useState(false);

    // Data State
    const [data, setData] = useState<AggregatedTrendPoint[]>(preLoadedData || []);

    // Loading States
    const [isInitialLoading, setIsInitialLoading] = useState(!preLoadedData && !isAmendmentView);
    const [isRefetching, setIsRefetching] = useState(false);
    const [error, setError] = useState(false);

    // --- 2. Data Fetching ---
    useEffect(() => {
        if (preLoadedData || isAmendmentView || !entityType) {
            setIsInitialLoading(false);
            return;
        }

        let isMounted = true;

        // Show overlay if we have data, otherwise initial loader
        if (data.length > 0) setIsRefetching(true);
        else setIsInitialLoading(true);

        setError(false);

        const fetchData = async () => {
            try {
                // Use stableIdsKey in the log to verify it's not looping
                // console.log("Fetching trends for:", stableIdsKey, groupingDimension);

                // Pass the actual `ids` array to the action
                const result = await getAggregatedTrends(entityType, ids, groupingDimension);

                if (isMounted) {
                    setData(result);
                    setIsInitialLoading(false);
                    setIsRefetching(false);
                }
            } catch (err) {
                console.error("Trend fetch error:", err);
                if (isMounted) {
                    setError(true);
                    setIsInitialLoading(false);
                    setIsRefetching(false);
                }
            }
        };

        fetchData();
        return () => { isMounted = false; };

        // Depend on `stableIdsKey` (string) instead of `ids` (array)
    }, [entityType, stableIdsKey, groupingDimension, preLoadedData, isAmendmentView]);

    // --- 3. Data Processing ---
    const amendmentChartData = useMemo(() => {
        if (!isAmendmentView || !amendmentsHistory) return null;
        const chronologicalAmendments = [...amendmentsHistory].sort((a, b) => a.amendment_number - b.amendment_number);
        return chronologicalAmendments.map((amendment, index) => {
            const date = new Date(amendment.amendment_date || amendment.agreement_start_date);
            const versionLabel = amendment.amendment_number === 0 ? "Original" : `Amendment ${amendment.amendment_number}`;
            return {
                year: formatDate(date),
                [versionLabel]: amendment.agreement_value,
                value: amendment.agreement_value,
                Funding: amendment.agreement_value,
                version: versionLabel,
                amendmentNumber: amendment.amendment_number,
                isInitial: index === 0,
                isFinal: index === chronologicalAmendments.length - 1
            };
        });
    }, [amendmentsHistory, isAmendmentView]);

    const chartData = useMemo(() => {
        if (isAmendmentView && amendmentChartData) {
            if (chartType === "line") {
                return { data: amendmentChartData, categories: ["Funding"] };
            } else {
                const categories = amendmentChartData.map(item => item.version).filter(Boolean);
                return { data: amendmentChartData, categories };
            }
        }

        if (!data || data.length === 0) return { data: [], categories: [] };

        const yearMap = new Map();
        const uniqueCategories = new Set<string>();

        data.forEach(point => {
            if (!showOther && point.category === 'Other') return;

            uniqueCategories.add(point.category);
            if (!yearMap.has(point.year)) yearMap.set(point.year, { year: point.year });
            const yearData = yearMap.get(point.year);
            yearData[point.category] = metricType === 'funding' ? point.funding : point.count;
        });

        const categories = Array.from(uniqueCategories).sort((a, b) => {
            if (a === 'Other') return 1;
            if (b === 'Other') return -1;
            return a.localeCompare(b);
        });

        return {
            data: Array.from(yearMap.values()).sort((a, b) => a.year - b.year),
            categories: categories
        };
    }, [data, metricType, isAmendmentView, amendmentsHistory, amendmentChartData, chartType, showOther]);

    // --- 4. Render Helpers ---
    const groupingDisplayOptions = useMemo(() => {
        const displayLabels: Record<string, string> = {
            org: "Funding Agency", city: "City", province: "Province/State",
            country: "Country", recipient: "Recipient", institute: "Institute",
            program: "Program", year: "Year", amendment: "Amendment Version",
        };
        return effectiveAvailableGroupings.map((g) => ({
            value: g,
            label: displayLabels[g] || formatSentenceCase(g),
            icon: getGroupingIcon(g)
        }));
    }, [effectiveAvailableGroupings]);

    const effectiveTitle = isAmendmentView
        ? "Grant Amendment History"
        : title || `${metricType === "funding" ? "Funding" : "Grant"} Trends`;

    const hasOtherData = useMemo(() => data.some(d => d.category === 'Other'), [data]);

    const renderChartArea = () => {
        if (isInitialLoading) {
            return <div style={{ height: height }}><LoadingState title="Analyzing data..." fullHeight className="h-full" /></div>;
        }
        if (error) {
            return <div style={{ height: height }}><ErrorState onRetry={() => window.location.reload()} className="h-full" /></div>;
        }
        if (chartData.data.length === 0) {
            return <div style={{ height: height }} className="flex items-center justify-center text-gray-500">No data available</div>;
        }

        return (
            <div className="relative w-full h-full">
                <div className={cn("transition-opacity duration-300 h-full", isRefetching ? "opacity-40" : "opacity-100")}>
                    <DataChart
                        data={chartData.data}
                        chartType={chartType === "line" ? "line" : "bar"}
                        dataType={metricType === "funding" ? "funding" : "counts"}
                        categories={chartData.categories}
                        height={height}
                        stacked={chartType === "stacked"}
                        showLegend={false}
                        isAmendmentView={isAmendmentView}
                    />
                </div>
                {isRefetching && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-100">
                            <LoadingSpinner size="md" className="text-blue-600" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
            <Card className={className}>
                <Card.Header
                    icon={icon}
                    className="flex flex-wrap items-center justify-between gap-1 md:gap-3"
                    title={effectiveTitle}
                >
                    {showControls && !isAmendmentView && (
                        <Dropdown
                            value={groupingDimension}
                            options={groupingDisplayOptions}
                            onChange={(value) => setGroupingDimension(value as GroupingDimension)}
                            disabled={isInitialLoading}
                        />
                    )}

                    {showControls && (
                        <div className={`flex flex-wrap w-full items-center justify-between py-2 lg:py-0 gap-2 lg:gap-3
                         ${isAmendmentView ? "justify-center md:justify-end" : "justify-between"}`}>
                            {availableMetrics && availableMetrics.length > 1 && !isAmendmentView && (
                                <ToggleButtons>
                                    {[["funding", LuDollarSign], ["count", LuHash]].map(([type, Icon], index) => (
                                        <Button
                                            key={index}
                                            onClick={() => setMetricType(type as MetricType)}
                                            className={cn(
                                                "px-3 py-1.5 text-[10px] md:text-xs font-medium border flex items-center gap-1",
                                                metricType === type ? "bg-gray-100 text-gray-800 border-gray-300" : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                                index === 0 ? "rounded-l-md" : index === 1 ? "rounded-r-md" : ""
                                            )}
                                        >
                                            <Icon className="size-2.75 md:size-3.5" />
                                            <span className="hidden md:inline">{formatSentenceCase(type as string)}</span>
                                        </Button>
                                    ))}
                                </ToggleButtons>
                            )}

                            {hasOtherData && (
                                <ToggleButtons>
                                    {[["Top 50"], ["Add Other"]].map(([label], index) => (
                                        <Button
                                            key={index}
                                            onClick={() => setShowOther(label === "Add Other")}
                                            className={cn(
                                                "px-3 py-1.5 text-[10px] md:text-xs font-medium border flex items-center gap-1",
                                                (showOther && index === 1) || (!showOther && index === 0)
                                                    ? "bg-gray-100 text-gray-800 border-gray-300"
                                                    : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                                index === 0 ? "rounded-l-md" : index === 1 ? "rounded-r-md" : ""
                                            )}
                                        >
                                            <span>{label as string}</span>
                                        </Button>
                                    ))}
                                </ToggleButtons>
                            )}

                            <ToggleButtons>
                                {[["line", LuChartSpline], ["stacked", LuChartColumnStacked], ["grouped", LuChartColumn]].map(([type, Icon], index) => (
                                    <Button
                                        key={index}
                                        onClick={() => setChartType(type as ChartType)}
                                        className={cn(
                                            "px-3 py-1.5 text-[10px] md:text-xs font-medium border flex items-center gap-1",
                                            chartType === type ? "bg-gray-100 text-gray-800 border-gray-300" : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200",
                                            index === 0 ? "rounded-l-md" : index === 2 ? "rounded-r-md" : ""
                                        )}
                                    >
                                        <Icon className="size-2.75 md:size-3.5" />
                                        <span className={isAmendmentView ? "" : "hidden md:inline"}>{formatSentenceCase(type as string)}</span>
                                    </Button>
                                ))}
                            </ToggleButtons>
                        </div>
                    )}
                </Card.Header>

                <Card.Content className="px-0">
                    <div className={cn(`h-[${height}px] w-full min-w-0 min-h-0`)}>
                        {renderChartArea()}
                    </div>

                    <AnimatePresence mode="wait">
                        {!isInitialLoading && chartData.categories.length > 0 && (
                            <motion.div
                                key={groupingDimension}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap justify-center mt-4 gap-3 pt-2">
                                    {chartData.categories.map((category, index) => (
                                        <div key={category} className="flex items-center text-xs">
                                            <span className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: getCategoryColor(category, index) }} />
                                            <span className="text-gray-600 max-w-[200px] truncate">{category}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card.Content>
            </Card>
        </motion.div>
    );
};

export default TrendVisualizer;
