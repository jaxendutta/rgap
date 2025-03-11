// src/components/features/grants/GrantCard.tsx
import { useState } from "react";
import { Grant } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import { formatCurrency, formatDate, formatDateDiff } from "@/utils/format";
import { Link } from "react-router-dom";
import {
    BookmarkPlus,
    University,
    BookMarked,
    Database,
    ArrowUpRight,
    MapPin,
    Calendar,
    ChevronDown,
    DollarSign,
    FileText,
    AlertCircle,
    Globe,
    History,
    TrendingUp,
    TrendingDown,
    FileEdit,
    CornerDownRight,
    CalendarDays,
    Layers,
    LineChart,
    Building,
    Hourglass,
    Calendar1,
    GraduationCap
} from "lucide-react";
import { formatSentenceCase } from "@/utils/format";
import { cn } from "@/utils/cn";
import Tag, { TagGroup } from "@/components/common/ui/Tag";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Bar,
    BarChart,
    Cell,
} from "recharts";

interface GrantCardProps {
    grant: Grant;
    onBookmark?: () => void;
}

export const GrantCard = ({ grant, onBookmark }: GrantCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "details" | "versions" | "funding"
    >("details");
    const [chartType, setChartType] = useState<"line" | "bar">("line");

    // Check if agreement title is empty or null
    const hasTitle =
        grant.agreement_title_en && grant.agreement_title_en.trim() !== "";

    // Check for optional fields existence before use
    const hasDescription =
        !!grant.description_en && grant.description_en.trim() !== "";
    const hasExpectedResults =
        !!grant.expected_results_en && grant.expected_results_en.trim() !== "";
    const hasForeignCurrency =
        !!grant.foreign_currency_type &&
        !!grant.foreign_currency_value &&
        grant.foreign_currency_value > 0;

    // Format amendment number for display (safely)
    const amendmentNumber = grant.amendment_number
        ? Number(grant.amendment_number) || 0
        : 0;

    // Check if this grant has amendments
    const hasAmendments =
        grant.amendments_history && grant.amendments_history.length > 1;

    // Sort amendments by number (descending - most recent first)
    const sortedAmendments = hasAmendments
        ? [...(grant.amendments_history || [])].sort((a, b) => {
              const numA = parseInt(a.amendment_number);
              const numB = parseInt(b.amendment_number);
              return numB - numA;
          })
        : [];

    // Format funding data for charts
    const prepareFundingChartData = () => {
        if (!hasAmendments) return [];

        // Create a reversed copy (chronological order) for the chart
        const chronologicalAmendments = [...sortedAmendments].reverse();

        return chronologicalAmendments.map((amendment, index) => {
            // Create a more detailed date representation using both month and year
            const date = new Date(
                amendment.amendment_date || amendment.agreement_start_date
            );
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
                .toString()
                .padStart(2, "0")}`;

            const versionLabel =
                amendment.amendment_number === "0"
                    ? "Original"
                    : `Amendment ${amendment.amendment_number}`;

            // Include formatted display date for tooltip
            const displayDate = formatDate(
                amendment.amendment_date || amendment.agreement_start_date
            );

            // Calculate percentage change from previous version
            let percentChange = 0;
            if (index > 0) {
                const previousValue =
                    chronologicalAmendments[index - 1].agreement_value;
                percentChange =
                    ((amendment.agreement_value - previousValue) /
                        previousValue) *
                    100;
            }

            return {
                name: formattedDate,
                value: amendment.agreement_value,
                version: versionLabel,
                index: index,
                percentChange: percentChange.toFixed(1),
                displayDate: displayDate,
            };
        });
    };

    const fundingChartData = prepareFundingChartData();

    // Function to render funding change indicator
    const renderChangeIndicator = (current: number, previous: number) => {
        const diff = current - previous;
        if (diff === 0) return null;

        return (
            <span
                className={cn(
                    "inline-flex items-start ml-2 px-2 py-0.5 rounded text-xs font-medium",
                    diff > 0
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                )}
            >
                {diff > 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                ) : (
                    <TrendingDown className="h-3 w-3 mr-1 mt-1 shrink-0" />
                )}
                {diff > 0 ? "+" : ""}
                {formatCurrency(diff)}
            </span>
        );
    };

    // Create metadata tags
    const metadataTags = [
        { icon: Database, text: grant.ref_number },
        {
            icon: MapPin,
            text:
                (grant.city && grant.city.toUpperCase() !== "N/A"
                    ? `${grant.city}, `
                    : "") +
                (grant.province && grant.province.toUpperCase() !== "N/A"
                    ? `${grant.province}, `
                    : "") +
                (grant.country && grant.country.toUpperCase() !== "N/A"
                    ? grant.country
                    : ""),
            hide: !(
                (grant.city && grant.city.toUpperCase() !== "N/A") ||
                (grant.province && grant.province.toUpperCase() !== "N/A") ||
                (grant.country && grant.country.toUpperCase() !== "N/A")
            ),
        },
        {
            icon: Calendar,
            text: `${formatDate(grant.agreement_start_date)} → ${formatDate(
                grant.agreement_end_date
            )}`,
        },
        {
            icon: Hourglass,
            text: formatDateDiff(
                grant.agreement_start_date,
                grant.agreement_end_date
            ),
        },
        { icon: Building, text: grant.org },
    ].filter((tag) => !tag.hide);

    // Custom tooltip for the charts
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-md shadow-md">
                    <p className="font-medium text-sm">
                        {payload[0].payload.version}
                    </p>
                    <p className="text-sm text-gray-700">
                        {payload[0].payload.displayDate}
                    </p>
                    <p className="text-sm font-medium">
                        {formatCurrency(payload[0].value)}
                    </p>
                    {payload[0].payload.percentChange !== "0.0" && (
                        <p
                            className={cn(
                                "text-xs mt-1",
                                Number(payload[0].payload.percentChange) > 0
                                    ? "text-green-600"
                                    : "text-amber-600"
                            )}
                        >
                            {Number(payload[0].payload.percentChange) > 0
                                ? "+"
                                : ""}
                            {payload[0].payload.percentChange}% from previous
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <Card isHoverable className="p-4 transition-all duration-300">
            <div>
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-6">
                    {/* Grant Details */}
                    <div className="flex-1">
                        {/* Recipient Name with Bookmark button inline */}
                        <div className="flex items-start justify-between gap-2 mb-2 lg:mb-1">
                            <Link
                                to={`/recipients/${grant.recipient_id}`}
                                className="inline-flex items-start text-lg font-medium hover:text-blue-700 transition-colors gap-1.5 group"
                                aria-label={`View profile for recipient ${grant.legal_name}`}
                            >
                                <span className="inline-flex">
                                    <GraduationCap className="h-5 w-5 mt-1 mr-1.5" />
                                    {grant.legal_name}
                                    <ArrowUpRight className="inline-block h-4 w-4 ml-1 mt-2.5 lg:mt-1.5 lg:opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                                </span>
                            </Link>

                            {/* Grant Values */}
                            <div className="flex items-center gap-3">
                                <Tag
                                    icon={Calendar1}
                                    size="md"
                                    pill={true}
                                    variant="outline"
                                    className="hidden lg:flex"
                                >
                                    {formatDate(grant.agreement_start_date)}
                                </Tag>
                                <span className="font-medium text-lg lg:text-xl">
                                    {formatCurrency(grant.agreement_value)}
                                </span>
                                {onBookmark && (
                                    <button
                                        onClick={onBookmark}
                                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        <BookmarkPlus className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <TagGroup spacing="normal">
                            {/* Institution */}
                            <Tag
                                icon={University}
                                size="md"
                                pill={true}
                                variant="link"
                                onClick={() =>
                                    (window.location.href = `/institutes/${grant.institute_id}`)
                                }
                                className="group w-full lg:w-auto"
                            >
                                <span className="flex items-center justify-between w-full gap-1.5">
                                    {grant.research_organization_name}
                                </span>
                            </Tag>

                            {/* Grant Title - Handle empty case */}
                            <Tag
                                icon={BookMarked}
                                size="md"
                                pill={true}
                                variant="default"
                                className={cn(
                                    !hasTitle && "text-gray-400 italic",
                                    "w-full lg:w-auto"
                                )}
                            >
                                {hasTitle
                                    ? formatSentenceCase(
                                          grant.agreement_title_en
                                      )
                                    : "No Agreement Title Record Found"}
                            </Tag>
                        </TagGroup>

                        {/* Tags */}
                        <div className="mt-1.5">
                            <TagGroup spacing="tight">
                                {metadataTags.map((tag, index) => (
                                    <Tag
                                        key={index}
                                        icon={tag.icon}
                                        size="sm"
                                        pill={true}
                                        variant="outline"
                                    >
                                        {tag.text}
                                    </Tag>
                                ))}
                            </TagGroup>
                        </div>
                    </div>
                </div>

                {/* Amendment History Badge - Always visible if amendments exist */}
                {hasAmendments && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={() => {
                                setIsExpanded(true);
                                setActiveTab("versions");
                            }}
                            className="inline-flex items-center bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700 text-xs font-medium rounded-full px-2.5 py-1"
                        >
                            <History className="h-3 w-3 mr-1" />
                            {typeof amendmentNumber === "number" &&
                            amendmentNumber > 0
                                ? `Latest Amendment: ${amendmentNumber}`
                                : "Original"}{" "}
                            • {sortedAmendments.length} versions
                        </button>

                        {/* Show funding change if available */}
                        {sortedAmendments.length > 1 && amendmentNumber > 0 && (
                            <div className="inline-flex items-center text-xs font-medium rounded-full px-2.5 py-1">
                                {(() => {
                                    // Find the previous amendment
                                    const currentAmendment =
                                        sortedAmendments.find(
                                            (a) =>
                                                a.amendment_number ===
                                                String(amendmentNumber)
                                        );
                                    const previousIndex =
                                        sortedAmendments.findIndex(
                                            (a) =>
                                                a.amendment_number ===
                                                String(amendmentNumber)
                                        ) + 1;
                                    const previousAmendment =
                                        previousIndex < sortedAmendments.length
                                            ? sortedAmendments[previousIndex]
                                            : null;

                                    if (currentAmendment && previousAmendment) {
                                        const valueDiff =
                                            currentAmendment.agreement_value -
                                            previousAmendment.agreement_value;

                                        if (valueDiff !== 0) {
                                            return (
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center",
                                                        valueDiff > 0
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-amber-50 text-amber-700"
                                                    )}
                                                >
                                                    {valueDiff > 0 ? (
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 mr-1" />
                                                    )}
                                                    {valueDiff > 0 ? "+" : ""}
                                                    {formatCurrency(valueDiff)}
                                                </span>
                                            );
                                        }
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
                    </div>
                )}

                {/* Expand/Collapse Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex w-full items-center justify-center p-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <ChevronDown
                        className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isExpanded && "transform rotate-180"
                        )}
                    />
                    <span className="ml-1">
                        {isExpanded ? "Show Less" : "Show More"}
                    </span>
                </button>

                {/* Expanded Content */}
                <div
                    className={cn(
                        "overflow-hidden transition-all duration-300 ease-in-out",
                        isExpanded
                            ? "opacity-100 max-h-[2000px] mt-2 lg:mt-4 pt-2 border-t"
                            : "opacity-0 max-h-0"
                    )}
                >
                    {/* Tabs */}
                    <div className="border-b mb-4">
                        <div className="flex -mb-px">
                            <button
                                className={cn(
                                    "px-2 lg:px-4 py-1 lg:py-2 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === "details"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                                onClick={() => setActiveTab("details")}
                            >
                                <span className="flex items-start">
                                    <FileText className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                    <span className="mr-1 hidden lg:flex">
                                        Grant
                                    </span>
                                    <span>Details</span>
                                </span>
                            </button>

                            {hasAmendments && (
                                <button
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                        activeTab === "versions"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    )}
                                    onClick={() => setActiveTab("versions")}
                                >
                                    <span className="flex items-start">
                                        <History className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                        <span className="mr-1 hidden lg:flex">
                                            Version
                                        </span>
                                        <span>History</span>
                                    </span>
                                </button>
                            )}

                            <button
                                className={cn(
                                    "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                                    activeTab === "funding"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                                onClick={() => setActiveTab("funding")}
                            >
                                <span className="flex items-start">
                                    <LineChart className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                    Funding Timeline
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-1">
                        {/* Details Tab */}
                        {activeTab === "details" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Auto-flowing sections */}
                                <div className="md:contents">
                                    {/* Reference Info - Styled as a card for better visual separation */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                                        <h3 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-100 flex items-center">
                                            <FileText className="h-4 w-4 mr-1.5 text-blue-600" />
                                            Grant Information
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Reference Number
                                                </span>
                                                <span className="col-span-7 text-gray-800 font-medium">
                                                    {grant.ref_number}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Current Version
                                                </span>
                                                <span
                                                    className={cn(
                                                        "col-span-7 font-medium",
                                                        amendmentNumber > 0
                                                            ? "text-amber-600"
                                                            : "text-gray-800"
                                                    )}
                                                >
                                                    {amendmentNumber > 0
                                                        ? `Amendment ${amendmentNumber}`
                                                        : "Original Agreement"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Program
                                                </span>
                                                <span className="col-span-7 text-gray-800">
                                                    {formatSentenceCase(
                                                        grant.agreement_title_en
                                                    )}
                                                </span>
                                            </div>

                                            {grant.amendment_date && (
                                                <div className="grid grid-cols-12 gap-2">
                                                    <span className="col-span-5 text-gray-500 self-start">
                                                        Amendment Date
                                                    </span>
                                                    <span className="col-span-7 text-gray-800">
                                                        {formatDate(
                                                            grant.amendment_date
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                                        <h3 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-100 flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1.5 text-blue-600" />
                                            Financial Information
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <div className="grid grid-cols-12 gap-2 items-center">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Current Value
                                                </span>
                                                <div className="col-span-7 flex items-center">
                                                    <span className="text-gray-800 font-medium">
                                                        {formatCurrency(
                                                            grant.agreement_value
                                                        )}
                                                    </span>
                                                    {hasAmendments &&
                                                        sortedAmendments.length >
                                                            1 &&
                                                        renderChangeIndicator(
                                                            grant.agreement_value,
                                                            sortedAmendments[
                                                                sortedAmendments.length -
                                                                    1
                                                            ].agreement_value
                                                        )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Funding Agency
                                                </span>
                                                <span className="col-span-7 text-gray-800 break-words">
                                                    {grant.org}
                                                    {grant.org_title && (
                                                        <span className="block text-gray-500 text-xs mt-1">
                                                            {
                                                                grant.org_title
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {hasForeignCurrency && (
                                                <div className="grid grid-cols-12 gap-2">
                                                    <span className="col-span-5 text-gray-500 self-start">
                                                        Foreign Currency
                                                    </span>
                                                    <span className="col-span-7 text-gray-800">
                                                        {
                                                            grant.foreign_currency_type
                                                        }{" "}
                                                        {grant.foreign_currency_value?.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}

                                            {hasAmendments &&
                                                sortedAmendments.length > 1 && (
                                                    <div className="grid grid-cols-12 gap-2">
                                                        <span className="col-span-5 text-gray-500 self-start">
                                                            Original Value
                                                        </span>
                                                        <span className="col-span-7 text-gray-800">
                                                            {formatCurrency(
                                                                sortedAmendments[
                                                                    sortedAmendments.length -
                                                                        1
                                                                ]
                                                                    .agreement_value
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                                        <h3 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-100 flex items-center">
                                            <CalendarDays className="h-4 w-4 mr-1.5 text-blue-600" />
                                            Timeline
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Start Date
                                                </span>
                                                <span className="col-span-7 text-gray-800">
                                                    {formatDate(
                                                        grant.agreement_start_date
                                                    )}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    End Date
                                                </span>
                                                <span className="col-span-7 text-gray-800">
                                                    {formatDate(
                                                        grant.agreement_end_date
                                                    )}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Duration
                                                </span>
                                                <span className="col-span-7 text-gray-800">
                                                    {(() => {
                                                        try {
                                                            // Calculate duration in months
                                                            const start =
                                                                new Date(
                                                                    grant.agreement_start_date
                                                                );
                                                            const end =
                                                                new Date(
                                                                    grant.agreement_end_date
                                                                );
                                                            const diffMonths =
                                                                (end.getFullYear() -
                                                                    start.getFullYear()) *
                                                                    12 +
                                                                end.getMonth() -
                                                                start.getMonth();
                                                            const years =
                                                                Math.floor(
                                                                    diffMonths /
                                                                        12
                                                                );
                                                            const months =
                                                                diffMonths % 12;

                                                            if (
                                                                years > 0 &&
                                                                months > 0
                                                            ) {
                                                                return `${years} ${
                                                                    years === 1
                                                                        ? "year"
                                                                        : "years"
                                                                } and ${months} ${
                                                                    months === 1
                                                                        ? "month"
                                                                        : "months"
                                                                }`;
                                                            } else if (
                                                                years > 0
                                                            ) {
                                                                return `${years} ${
                                                                    years === 1
                                                                        ? "year"
                                                                        : "years"
                                                                }`;
                                                            } else {
                                                                return `${months} ${
                                                                    months === 1
                                                                        ? "month"
                                                                        : "months"
                                                                }`;
                                                            }
                                                        } catch (e) {
                                                            return "Unknown";
                                                        }
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                                        <h3 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-100 flex items-center">
                                            <Globe className="h-4 w-4 mr-1.5 text-blue-600" />
                                            Location
                                        </h3>
                                        <div className="text-sm space-y-1">
                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Country
                                                </span>
                                                <span
                                                    className={cn(
                                                        "col-span-7",
                                                        grant.country &&
                                                            grant.country.toUpperCase() !==
                                                                "N/A"
                                                            ? "text-gray-800"
                                                            : "text-gray-400 italic"
                                                    )}
                                                >
                                                    {grant.country &&
                                                    grant.country.toUpperCase() !==
                                                        "N/A"
                                                        ? grant.country
                                                        : "Not specified"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Province/State
                                                </span>
                                                <span
                                                    className={cn(
                                                        "col-span-7",
                                                        grant.province &&
                                                            grant.province.toUpperCase() !==
                                                                "N/A"
                                                            ? "text-gray-800"
                                                            : "text-gray-400 italic"
                                                    )}
                                                >
                                                    {grant.province &&
                                                    grant.province.toUpperCase() !==
                                                        "N/A"
                                                        ? grant.province
                                                        : "Not specified"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    City
                                                </span>
                                                <span
                                                    className={cn(
                                                        "col-span-7",
                                                        grant.city &&
                                                            grant.city.toUpperCase() !==
                                                                "N/A"
                                                            ? "text-gray-800"
                                                            : "text-gray-400 italic"
                                                    )}
                                                >
                                                    {grant.city &&
                                                    grant.city.toUpperCase() !==
                                                        "N/A"
                                                        ? grant.city
                                                        : "Not specified"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {hasDescription && (
                                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                                            <h3 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-100 flex items-center">
                                                <FileEdit className="h-4 w-4 mr-1.5 text-blue-600" />
                                                Description
                                            </h3>
                                            <div className="text-sm text-gray-700 leading-relaxed">
                                                <p>{grant.description_en}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Expected Results */}
                                    {hasExpectedResults && (
                                        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                                            <h3 className="text-sm font-semibold text-gray-800 pb-2 mb-3 border-b border-gray-100 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1.5 text-blue-600" />
                                                Expected Results
                                            </h3>
                                            <div className="text-sm text-gray-700 leading-relaxed">
                                                <p>
                                                    {grant.expected_results_en}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Version History Tab */}
                        {activeTab === "versions" && hasAmendments && (
                            <div>
                                {/* Timeline header */}
                                <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Layers className="h-4 w-4 mr-1.5" />
                                        Version Timeline
                                    </h3>
                                    <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
                                        <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                            <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">
                                                Total Versions
                                            </h4>
                                            <p className="text-sm lg:text-md font-semibold text-gray-900">
                                                {sortedAmendments.length}
                                            </p>
                                        </div>
                                        {sortedAmendments.length > 1 && (
                                            <>
                                                <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                    <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">
                                                        First Version
                                                    </h4>
                                                    <p className="text-sm lg:text-md font-semibold text-gray-900">
                                                        {formatDate(
                                                            sortedAmendments[
                                                                sortedAmendments.length -
                                                                    1
                                                            ]
                                                                .agreement_start_date
                                                        )}
                                                    </p>
                                                </div>
                                                <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                    <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">
                                                        Latest Version
                                                    </h4>
                                                    <p className="text-sm lg:text-md font-semibold text-gray-900">
                                                        {formatDate(
                                                            sortedAmendments[0]
                                                                .amendment_date ||
                                                                sortedAmendments[0]
                                                                    .agreement_start_date
                                                        )}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Visualization of amendment timeline */}
                                <div className="relative pt-4 lg:pt-6 pb-4">
                                    {/* Timeline line */}
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                                    {/* Amendment entries */}
                                    <div className="space-y-6 lg:space-y-8">
                                        {sortedAmendments.map(
                                            (amendment, index) => (
                                                <div
                                                    key={
                                                        amendment.amendment_number
                                                    }
                                                    className="relative pl-12 lg:pl-16"
                                                >
                                                    {/* Timeline dot */}
                                                    <div
                                                        className={cn(
                                                            "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                            amendment.amendment_number ===
                                                                "0"
                                                                ? "border-blue-500 bg-white"
                                                                : "border-amber-500 bg-white"
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                amendment.amendment_number ===
                                                                    "0"
                                                                    ? "bg-blue-500"
                                                                    : "bg-amber-500"
                                                            )}
                                                        ></div>
                                                    </div>

                                                    {/* Amendment card */}
                                                    <div className="bg-white border rounded-lg shadow-sm">
                                                        <div className="p-3 lg:p-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4
                                                                        className={cn(
                                                                            "text-sm font-medium",
                                                                            amendment.amendment_number ===
                                                                                "0"
                                                                                ? "text-blue-600"
                                                                                : "text-amber-600"
                                                                        )}
                                                                    >
                                                                        {amendment.amendment_number ===
                                                                        "0"
                                                                            ? "Original Agreement"
                                                                            : `Amendment ${amendment.amendment_number}`}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {amendment.amendment_date
                                                                            ? formatDate(
                                                                                  amendment.amendment_date
                                                                              )
                                                                            : formatDate(
                                                                                  amendment.agreement_start_date
                                                                              )}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium">
                                                                        {formatCurrency(
                                                                            amendment.agreement_value
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Changes from previous version */}
                                                        {index <
                                                            sortedAmendments.length -
                                                                1 && (
                                                            <div className="border-t px-4 py-3 bg-gray-50 rounded-b-lg">
                                                                <p className="text-xs font-medium text-gray-600 mb-2">
                                                                    Registered
                                                                    changes from
                                                                    previous
                                                                    version:
                                                                </p>
                                                                <div className="space-y-2 text-sm">
                                                                    {/* Amount change */}
                                                                    {amendment.agreement_value !==
                                                                        sortedAmendments[
                                                                            index +
                                                                                1
                                                                        ]
                                                                            .agreement_value && (
                                                                        <div className="flex items-start">
                                                                            <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0 text-gray-400" />
                                                                            <span className="text-gray-600">
                                                                                Funding
                                                                                changed
                                                                                from
                                                                                <span className="font-medium mx-1">
                                                                                    {formatCurrency(
                                                                                        sortedAmendments[
                                                                                            index +
                                                                                                1
                                                                                        ]
                                                                                            .agreement_value
                                                                                    )}
                                                                                </span>
                                                                                to
                                                                                <span
                                                                                    className={cn(
                                                                                        "font-medium mx-1",
                                                                                        amendment.agreement_value >
                                                                                            sortedAmendments[
                                                                                                index +
                                                                                                    1
                                                                                            ]
                                                                                                .agreement_value
                                                                                            ? "text-green-600"
                                                                                            : "text-amber-600"
                                                                                    )}
                                                                                >
                                                                                    {formatCurrency(
                                                                                        amendment.agreement_value
                                                                                    )}
                                                                                    {amendment.agreement_value >
                                                                                    sortedAmendments[
                                                                                        index +
                                                                                            1
                                                                                    ]
                                                                                        .agreement_value
                                                                                        ? ` (+${formatCurrency(
                                                                                              amendment.agreement_value -
                                                                                                  sortedAmendments[
                                                                                                      index +
                                                                                                          1
                                                                                                  ]
                                                                                                      .agreement_value
                                                                                          )})`
                                                                                        : ` (-${formatCurrency(
                                                                                              sortedAmendments[
                                                                                                  index +
                                                                                                      1
                                                                                              ]
                                                                                                  .agreement_value -
                                                                                                  amendment.agreement_value
                                                                                          )})`}
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {/* End date change */}
                                                                    {amendment.agreement_end_date !==
                                                                        sortedAmendments[
                                                                            index +
                                                                                1
                                                                        ]
                                                                            .agreement_end_date && (
                                                                        <div className="flex items-start">
                                                                            <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0  text-gray-400" />
                                                                            <span className="text-gray-600">
                                                                                End
                                                                                date
                                                                                extended
                                                                                from
                                                                                <span className="font-medium mx-1">
                                                                                    {formatDate(
                                                                                        sortedAmendments[
                                                                                            index +
                                                                                                1
                                                                                        ]
                                                                                            .agreement_end_date
                                                                                    )}
                                                                                </span>
                                                                                to
                                                                                <span className="font-medium mx-1">
                                                                                    {formatDate(
                                                                                        amendment.agreement_end_date
                                                                                    )}
                                                                                </span>

                                                                                (
                                                                                {formatDateDiff(
                                                                                    sortedAmendments[
                                                                                        index +
                                                                                            1
                                                                                    ]
                                                                                        .agreement_end_date,
                                                                                    amendment.agreement_end_date
                                                                                )}

                                                                                )
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Funding Timeline Tab */}
                        {activeTab === "funding" && (
                            <div>
                                {/* Funding summary header */}
                                <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-start">
                                        <LineChart className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                                        Funding Overview
                                    </h3>

                                    {hasAmendments &&
                                    sortedAmendments.length > 1 ? (
                                        <div className="grid grid-cols-3 gap-2 lg:gap-4 lg:text-sm text-center">
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">
                                                    Original Value
                                                </p>
                                                <p className="text-gray-900 font-medium text-md lg:text-lg">
                                                    {formatCurrency(
                                                        sortedAmendments[
                                                            sortedAmendments.length -
                                                                1
                                                        ].agreement_value
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">
                                                    Current Value
                                                </p>
                                                <p className="text-gray-900 font-medium text-md lg:text-lg">
                                                    {formatCurrency(
                                                        grant.agreement_value
                                                    )}
                                                </p>
                                            </div>
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">
                                                    Total Change
                                                </p>
                                                <p
                                                    className={cn(
                                                        "font-medium text-md lg:text-lg",
                                                        grant.agreement_value >
                                                            sortedAmendments[
                                                                sortedAmendments.length -
                                                                    1
                                                            ].agreement_value
                                                            ? "text-green-600"
                                                            : grant.agreement_value <
                                                              sortedAmendments[
                                                                  sortedAmendments.length -
                                                                      1
                                                              ].agreement_value
                                                            ? "text-amber-600"
                                                            : "text-gray-900"
                                                    )}
                                                >
                                                    {grant.agreement_value !==
                                                    sortedAmendments[
                                                        sortedAmendments.length -
                                                            1
                                                    ].agreement_value ? (
                                                        grant.agreement_value >
                                                        sortedAmendments[
                                                            sortedAmendments.length -
                                                                1
                                                        ].agreement_value ? (
                                                            <>
                                                                +
                                                                {formatCurrency(
                                                                    grant.agreement_value -
                                                                        sortedAmendments[
                                                                            sortedAmendments.length -
                                                                                1
                                                                        ]
                                                                            .agreement_value
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                -
                                                                {formatCurrency(
                                                                    sortedAmendments[
                                                                        sortedAmendments.length -
                                                                            1
                                                                    ]
                                                                        .agreement_value -
                                                                        grant.agreement_value
                                                                )}
                                                            </>
                                                        )
                                                    ) : (
                                                        <>No change</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-sm text-gray-500 py-4">
                                            <p>
                                                No amendment history available
                                                for this grant.
                                            </p>
                                            <p>
                                                Current value:{" "}
                                                {formatCurrency(
                                                    grant.agreement_value
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Chart type toggle */}
                                {hasAmendments &&
                                    sortedAmendments.length > 1 && (
                                        <div className="flex justify-end mb-4">
                                            <div
                                                className="inline-flex rounded-md shadow-sm"
                                                role="group"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setChartType("line")
                                                    }
                                                    className={cn(
                                                        "px-3 py-1 text-xs font-medium border border-gray-200 rounded-l-lg",
                                                        chartType === "line"
                                                            ? "bg-gray-100 text-gray-900"
                                                            : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    Line Chart
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setChartType("bar")
                                                    }
                                                    className={cn(
                                                        "px-3 py-1 text-xs font-medium border border-gray-200 rounded-r-lg",
                                                        chartType === "bar"
                                                            ? "bg-gray-100 text-gray-900"
                                                            : "bg-white text-gray-500 hover:bg-gray-50"
                                                    )}
                                                >
                                                    Bar Chart
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                {/* Enhanced funding visualization with actual line/bar charts */}
                                {hasAmendments &&
                                    sortedAmendments.length > 1 && (
                                        <div className="mt-6 px-1">
                                            {/* Recharts chart visualization */}
                                            <div className="h-64 md:h-80">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    {chartType === "line" ? (
                                                        <RechartsLineChart
                                                            data={
                                                                fundingChartData
                                                            }
                                                            margin={{
                                                                top: 10,
                                                                right: 30,
                                                                left: 0,
                                                                bottom: 20,
                                                            }}
                                                        >
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                stroke="#f0f0f0"
                                                            />
                                                            <XAxis
                                                                dataKey="name"
                                                                tickLine={false}
                                                                axisLine={{
                                                                    stroke: "#e5e7eb",
                                                                }}
                                                                tick={{
                                                                    fontSize: 11,
                                                                }}
                                                                tickFormatter={(
                                                                    value
                                                                ) => {
                                                                    // Show month and year instead of just year
                                                                    const parts =
                                                                        value.split(
                                                                            "-"
                                                                        );
                                                                    const year =
                                                                        parts[0];
                                                                    const month =
                                                                        parts[1];
                                                                    return `${month}/${year.slice(
                                                                        2
                                                                    )}`;
                                                                }}
                                                                angle={-30}
                                                            />
                                                            <YAxis
                                                                tickFormatter={(
                                                                    value
                                                                ) => {
                                                                    const millions =
                                                                        value /
                                                                        1000000;
                                                                    if (
                                                                        millions >=
                                                                        1
                                                                    ) {
                                                                        return `${millions.toFixed(
                                                                            1
                                                                        )}M`;
                                                                    } else {
                                                                        const thousands =
                                                                            value /
                                                                            1000;
                                                                        return `${thousands.toFixed(
                                                                            0
                                                                        )}k`;
                                                                    }
                                                                }}
                                                                tickLine={false}
                                                                axisLine={{
                                                                    stroke: "#e5e7eb",
                                                                }}
                                                                tick={{
                                                                    fontSize: 11,
                                                                }}
                                                                width={50}
                                                            />
                                                            <Tooltip
                                                                content={
                                                                    <CustomTooltip />
                                                                }
                                                            />
                                                            <Line
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke="#2563eb"
                                                                strokeWidth={2}
                                                                dot={{
                                                                    r: 6,
                                                                    fill: "#2563eb",
                                                                    strokeWidth: 0,
                                                                }}
                                                                activeDot={{
                                                                    r: 8,
                                                                    fill: "#2563eb",
                                                                    strokeWidth: 0,
                                                                }}
                                                            />
                                                        </RechartsLineChart>
                                                    ) : (
                                                        <BarChart
                                                            data={
                                                                fundingChartData
                                                            }
                                                            margin={{
                                                                top: 10,
                                                                right: 30,
                                                                left: 0,
                                                                bottom: 20,
                                                            }}
                                                        >
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                stroke="#f0f0f0"
                                                            />
                                                            <XAxis
                                                                dataKey="name"
                                                                tickLine={false}
                                                                axisLine={{
                                                                    stroke: "#e5e7eb",
                                                                }}
                                                                tick={{
                                                                    fontSize: 11,
                                                                }}
                                                                tickFormatter={(
                                                                    value
                                                                ) => {
                                                                    // Show month and year instead of just year
                                                                    const parts =
                                                                        value.split(
                                                                            "-"
                                                                        );
                                                                    const year =
                                                                        parts[0];
                                                                    const month =
                                                                        parts[1];
                                                                    return `${month}/${year.slice(
                                                                        2
                                                                    )}`;
                                                                }}
                                                                angle={-30}
                                                            />
                                                            <YAxis
                                                                tickFormatter={(
                                                                    value
                                                                ) => {
                                                                    const millions =
                                                                        value /
                                                                        1000000;
                                                                    if (
                                                                        millions >=
                                                                        1
                                                                    ) {
                                                                        return `${millions.toFixed(
                                                                            1
                                                                        )}M`;
                                                                    } else {
                                                                        const thousands =
                                                                            value /
                                                                            1000;
                                                                        return `${thousands.toFixed(
                                                                            0
                                                                        )}k`;
                                                                    }
                                                                }}
                                                                tickLine={false}
                                                                axisLine={{
                                                                    stroke: "#e5e7eb",
                                                                }}
                                                                tick={{
                                                                    fontSize: 11,
                                                                }}
                                                                width={50}
                                                            />
                                                            <Tooltip
                                                                content={
                                                                    <CustomTooltip />
                                                                }
                                                            />
                                                            <Bar
                                                                dataKey="value"
                                                                fill="#3b82f6"
                                                                radius={[
                                                                    4, 4, 0, 0,
                                                                ]}
                                                            >
                                                                {fundingChartData.map(
                                                                    (
                                                                        _,
                                                                        index
                                                                    ) => (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={
                                                                                index ===
                                                                                0
                                                                                    ? "#3b82f6" // First (original)
                                                                                    : index ===
                                                                                      fundingChartData.length -
                                                                                          1
                                                                                    ? "#10b981" // Last (current)
                                                                                    : "#f59e0b" // Middle (amendments)
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </Bar>
                                                        </BarChart>
                                                    )}
                                                </ResponsiveContainer>
                                            </div>

                                            {/* Legend */}
                                            <div className="flex justify-center space-x-6 mt-4">
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                                                    <span className="text-xs text-gray-600">
                                                        Original
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
                                                    <span className="text-xs text-gray-600">
                                                        Amendments
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                                                    <span className="text-xs text-gray-600">
                                                        Current
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
