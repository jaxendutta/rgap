// src/components/features/grants/GrantCard.tsx
import { useState } from "react";
import { Grant } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import {
    formatCommaSeparated,
    formatCurrency,
    formatDate,
    formatDateDiff,
} from "@/utils/format";
import { Link } from "react-router-dom";
import {
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
    History,
    TrendingUp,
    TrendingDown,
    CornerDownRight,
    Layers,
    LineChart,
    Hourglass,
    Calendar1,
    GraduationCap,
    Landmark,
    BookOpen,
} from "lucide-react";
import { cn } from "@/utils/cn";
import Tag, { Tags } from "@/components/common/ui/Tag";
import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { TrendVisualizer } from "../visualizations/TrendVisualizer";
import Tabs, { TabContent, TabItem } from "@/components/common/ui/Tabs";

interface GrantCardProps {
    grant: Grant;
    isBookmarked?: boolean;
}

export const GrantCard = ({
    grant,
    isBookmarked: propIsBookmarked,
}: GrantCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "details" | "versions" | "funding"
    >("details");

    // Check if a field has a value
    const hasValue = (field: keyof Grant) =>
        !!grant[field] && (grant[field] as unknown as string).trim() !== "";

    // Check for optional fields existence before use
    const hasForeignCurrency =
        !!grant.foreign_currency_type &&
        !!grant.foreign_currency_value &&
        grant.foreign_currency_value > 0;

    // Use the component's prop value if provided, otherwise use the value from the API response
    const isBookmarked =
        propIsBookmarked !== undefined ? propIsBookmarked : grant.is_bookmarked;

    // Format amendment number for display
    const amendmentNumber = grant.latest_amendment_number
        ? grant.latest_amendment_number
        : 0;

    // Check if this grant has amendments
    const hasAmendments =
        grant.amendments_history && grant.amendments_history.length > 0;

    // Initialize sorted amendments array
    const amendments = hasAmendments
        ? [...(grant.amendments_history || [])]
        : [];

    // Add current grant data as an amendment if it's not already in the history
    if (hasAmendments && grant.latest_amendment_number) {
        const currentAmendmentNumber = Number(grant.latest_amendment_number);

        // Check if this amendment number already exists in the amendments
        const currentAmendmentExists = amendments.some(
            (a) => a.amendment_number === currentAmendmentNumber
        );

        // Add current grant as amendment if not already present
        if (!currentAmendmentExists) {
            amendments.push({
                amendment_number: currentAmendmentNumber,
                amendment_date:
                    grant.amendment_date || grant.agreement_start_date,
                agreement_value: grant.agreement_value,
                agreement_start_date: grant.agreement_start_date,
                agreement_end_date: grant.agreement_end_date,
                additional_information_en: grant.additional_information_en,
            });
        }
    }

    // Sort amendments by number (descending - most recent first)
    amendments.sort((a, b) => b.amendment_number - a.amendment_number);

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

    // Metadata tags for the grant
    const metadataTags = [
        { icon: Database, text: grant.ref_number },
        {
            icon: MapPin,
            text: formatCommaSeparated([
                grant.city,
                grant.province,
                grant.country,
            ]),
            hide: !(
                (grant.city && grant.city.toUpperCase() !== "N/A") ||
                (grant.province && grant.province.toUpperCase() !== "N/A") ||
                (grant.country && grant.country.toUpperCase() !== "N/A")
            ),
        },
        {
            icon: Calendar,
            text: `${formatDate(new Date(grant.agreement_start_date))} → ${
                grant.agreement_end_date
                    ? formatDate(new Date(grant.agreement_end_date))
                    : "N/A"
            }`,
        },
        {
            icon: Hourglass,
            text: (() => {
                // If no end date or end date is same/before start date
                if (!grant.agreement_end_date) {
                    return "One-time payment";
                }

                const start = new Date(grant.agreement_start_date);
                const end = new Date(grant.agreement_end_date);

                // Check if it's a one-time payment
                if (end.getTime() <= start.getTime()) {
                    return "One-time payment";
                }

                // Otherwise show the normal duration
                return formatDateDiff(
                    grant.agreement_start_date,
                    grant.agreement_end_date
                );
            })(),
        },
        { icon: Landmark, text: grant.org },
    ].filter((tag) => !tag.hide);

    const tabs: TabItem[] = [
        {
            id: "details",
            label: "Details",
            icon: FileText,
        },
        {
            id: "funding",
            label: "Funding Timeline",
            icon: LineChart,
        },
    ];

    if (hasAmendments) {
        tabs.splice(1, 0, {
            id: "versions",
            label: "Version History",
            icon: History,
        });
    }

    return (
        <Card isHoverable className="p-4 transition-all duration-300">
            <div>
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-2 lg:gap-6">
                    {/* Grant Details */}
                    <div className="flex-1 max-w-full">
                        {/* Recipient Name with Bookmark button inline */}
                        <div className="flex items-start justify-between gap-2 mb-2 lg:mb-1">
                            <Link
                                to={`/recipients/${grant.recipient_id}`}
                                className="flex text-lg font-medium hover:text-blue-700 transition-colors gap-1.5 group"
                                aria-label={`View profile for recipient ${grant.legal_name}`}
                            >
                                <GraduationCap className="h-5 w-5 mt-1 align-text-bottom flex-shrink-0" />
                                <span className="inline-block">
                                    {grant.legal_name}
                                    <ArrowUpRight className="inline-block h-4 w-4 ml-1 align-text-bottom opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all" />
                                </span>
                            </Link>

                            {/* Grant Values */}
                            <div className="flex items-center gap-3">
                                <Tag
                                    icon={Calendar1}
                                    size="md"
                                    variant="outline"
                                    className="hidden lg:flex"
                                    text={formatDate(
                                        grant.agreement_start_date
                                    )}
                                />
                                <span className="font-medium text-lg lg:text-xl">
                                    {formatCurrency(grant.agreement_value)}
                                </span>

                                {/* Bookmark Button */}
                                <BookmarkButton
                                    entityId={grant.grant_id}
                                    entityType="grant"
                                    isBookmarked={isBookmarked}
                                    size="md"
                                    iconOnly={true}
                                />
                            </div>
                        </div>

                        <Tags spacing="normal">
                            {/* Institution */}
                            <Tag
                                icon={University}
                                size="md"
                                variant="link"
                                onClick={() =>
                                    (window.location.href = `/institutes/${grant.institute_id}`)
                                }
                                text={grant.research_organization_name}
                                className="group w-full lg:w-auto"
                            />

                            {/* Grant Title - Handle empty case */}
                            <Tag
                                icon={BookMarked}
                                size="md"
                                variant="outline"
                                className={cn(
                                    !hasValue("agreement_title_en") &&
                                        "text-gray-400 italic",
                                    "w-full lg:w-min"
                                )}
                                text={
                                    grant.agreement_title_en ||
                                    "No Agreement Title Record Found"
                                }
                            />
                        </Tags>

                        {/* Tags */}
                        <div className="mt-1.5">
                            <Tags spacing="tight">
                                {metadataTags.map((tag, index) => (
                                    <Tag
                                        key={index}
                                        icon={tag.icon}
                                        size="sm"
                                        variant="default"
                                        text={tag.text}
                                    />
                                ))}
                            </Tags>
                        </div>
                    </div>
                </div>

                {/* Amendment History Badge - Always visible if amendments exist */}
                {hasAmendments && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        <button
                            onClick={() => {
                                setIsExpanded(true);
                                setActiveTab("funding");
                            }}
                            className="inline-flex items-center bg-blue-50 hover:bg-blue-100 transition-colors text-blue-700 text-xs font-medium rounded-full px-2.5 py-1"
                        >
                            <History className="h-3 w-3 mr-1" />
                            {typeof amendmentNumber === "number" &&
                                (amendmentNumber > 0
                                    ? `Amendment ${amendmentNumber} `
                                    : `Original `) +
                                    `• Versions available: ${amendments.length}`}
                        </button>

                        {/* Show funding change if available */}
                        {amendments.length > 0 && amendmentNumber > 0 && (
                            <div className="inline-flex items-center text-xs font-medium rounded-full px-2.5 py-1">
                                {(() => {
                                    // Find the previous amendment
                                    const currentAmendment = amendments.find(
                                        (a) =>
                                            a.amendment_number ===
                                            amendmentNumber
                                    );
                                    const previousIndex =
                                        amendments.findIndex(
                                            (a) =>
                                                a.amendment_number ===
                                                amendmentNumber
                                        ) + 1;
                                    const previousAmendment =
                                        previousIndex < amendments.length
                                            ? amendments[previousIndex]
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
                        "flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out",
                        isExpanded
                            ? "opacity-100 max-h-[2000px] pt-4"
                            : "opacity-0 max-h-0"
                    )}
                >
                    {/* Tabs */}
                    <Tabs
                        className="mb-2"
                        variant="pills"
                        fullWidth={true}
                        activeTab={activeTab}
                        onChange={(tabId: string) =>
                            setActiveTab(
                                tabId as "details" | "versions" | "funding"
                            )
                        }
                        tabs={tabs}
                    />

                    {/* Tab Content */}
                    <TabContent activeTab={activeTab}>
                        {/* Details Tab */}
                        {activeTab === "details" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Auto-flowing sections */}
                                <div className="md:contents">
                                    {/* Reference Info - Styled as a card for better visual separation */}
                                    <Card>
                                        <Card.Header
                                            title="Grant Information"
                                            icon={Database}
                                            size="sm"
                                        />
                                        <Card.Content
                                            size={"sm"}
                                            className="text-sm text-gray-700 space-y-1"
                                        >
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
                                                    Program
                                                </span>
                                                <span
                                                    className={
                                                        hasValue(
                                                            "prog_title_en"
                                                        )
                                                            ? "col-span-7 text-gray-800"
                                                            : "col-span-7 text-gray-400 italic"
                                                    }
                                                >
                                                    {grant.prog_title_en ||
                                                        "Not specified"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Agreement Title
                                                </span>
                                                <span
                                                    className={
                                                        hasValue(
                                                            "agreement_title_en"
                                                        )
                                                            ? "col-span-7 text-gray-800"
                                                            : "col-span-7 text-gray-400 italic"
                                                    }
                                                >
                                                    {grant.agreement_title_en ||
                                                        "Not specified"}
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
                                        </Card.Content>
                                    </Card>

                                    {/* Financial Summary */}
                                    <Card>
                                        <Card.Header
                                            title="Funding Summary"
                                            icon={DollarSign}
                                            size={"sm"}
                                        />
                                        <Card.Content
                                            size={"sm"}
                                            className="text-sm text-gray-700 space-y-1"
                                        >
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
                                                        amendments.length > 1 &&
                                                        renderChangeIndicator(
                                                            grant.agreement_value,
                                                            amendments[
                                                                amendments.length -
                                                                    1
                                                            ].agreement_value
                                                        )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <span className="col-span-5 text-gray-500 self-start">
                                                    Current Version
                                                </span>
                                                <span
                                                    className={cn(
                                                        "col-span-7",
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
                                                    Funding Agency
                                                </span>
                                                <span className="col-span-7 text-gray-800 break-words">
                                                    {grant.org}
                                                    {grant.org_title && (
                                                        <span className="block text-gray-500 text-xs mt-1">
                                                            {grant.org_title}
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
                                                        }
                                                        {grant.foreign_currency_value?.toLocaleString()}
                                                    </span>
                                                </div>
                                            )}

                                            {hasAmendments &&
                                                amendments.length > 0 && (
                                                    <div className="grid grid-cols-12 gap-2">
                                                        <span className="col-span-5 text-gray-500 self-start">
                                                            Original Value
                                                        </span>
                                                        <span className="col-span-7 text-gray-800">
                                                            {formatCurrency(
                                                                amendments[
                                                                    amendments.length -
                                                                        1
                                                                ]
                                                                    .agreement_value
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                        </Card.Content>
                                    </Card>

                                    {/* Timeline */}
                                    <Card>
                                        <Card.Header
                                            title="Funding Timeline"
                                            icon={Calendar}
                                            size={"sm"}
                                        />
                                        <Card.Content
                                            size={"sm"}
                                            className="text-sm text-gray-700 space-y-1"
                                        >
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
                                                    {formatDateDiff(
                                                        grant.agreement_start_date,
                                                        grant.agreement_end_date
                                                    ) === "Same date"
                                                        ? "One-time payment"
                                                        : formatDateDiff(
                                                              grant.agreement_start_date,
                                                              grant.agreement_end_date
                                                          )}
                                                </span>
                                            </div>
                                        </Card.Content>
                                    </Card>

                                    {/* Location */}
                                    <Card>
                                        <Card.Header
                                            title="Location"
                                            icon={MapPin}
                                            size={"sm"}
                                        />
                                        <Card.Content
                                            size="sm"
                                            className="text-sm text-gray-700 space-y-1"
                                        >
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
                                        </Card.Content>
                                    </Card>

                                    {/* Program Information */}
                                    <Card>
                                        <Card.Header
                                            title={
                                                grant.prog_title_en ||
                                                "Program Information"
                                            }
                                            subtitle={
                                                grant.prog_title_en
                                                    ? "Program Information"
                                                    : "Unspecified Program Name"
                                            }
                                            icon={BookOpen}
                                            size={"sm"}
                                        />
                                        <Card.Content
                                            size="sm"
                                            className="text-sm text-gray-700 p-4"
                                        >
                                            {hasValue("prog_purpose_en")
                                                ? grant.prog_purpose_en
                                                : "Program purpose not specified"}
                                        </Card.Content>
                                    </Card>

                                    {/* Description */}
                                    <Card>
                                        <Card.Header
                                            title={
                                                grant.agreement_title_en ||
                                                "Agreement Description"
                                            }
                                            subtitle={
                                                grant.agreement_title_en
                                                    ? "Agreement Description"
                                                    : "Unspecified Agreement Description"
                                            }
                                            icon={FileText}
                                            size={"sm"}
                                        />
                                        <Card.Content
                                            size="sm"
                                            className="text-sm text-gray-700 p-4"
                                        >
                                            {grant.description_en ||
                                                "Agreement description not specified"}
                                        </Card.Content>
                                    </Card>

                                    {/* Expected Results */}
                                    {hasValue("expected_results_en") && (
                                        <Card>
                                            <Card.Header
                                                title="Expected Results"
                                                icon={AlertCircle}
                                                size={"sm"}
                                            />
                                            <Card.Content
                                                size="sm"
                                                className="text-sm text-gray-700 p-4"
                                            >
                                                {grant.expected_results_en ||
                                                    "Not specified"}
                                            </Card.Content>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Version History Tab - Timeline Section */}
                        {activeTab === "versions" && hasAmendments && (
                            <div>
                                {/* Timeline header */}
                                <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-xl">
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
                                                {amendments.length}
                                            </p>
                                        </div>
                                        {amendments.length > 0 && (
                                            <>
                                                <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                    <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">
                                                        First Version
                                                    </h4>
                                                    <p className="text-sm lg:text-md font-semibold text-gray-900">
                                                        {formatDate(
                                                            amendments[
                                                                amendments.length -
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
                                                            amendments[0]
                                                                .amendment_date ||
                                                                amendments[0]
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
                                        {/* First ensure we have the current grant as the newest amendment */}
                                        {(() => {
                                            // Render the amendments in newest-to-oldest order
                                            return amendments.map(
                                                (amendment, index) => {
                                                    // Get the next (older) amendment for comparison if it exists
                                                    const prevAmendment =
                                                        amendments[index + 1];

                                                    // Check if there are any changes to display
                                                    const hasValueChange =
                                                        prevAmendment &&
                                                        amendment.agreement_value !==
                                                            prevAmendment.agreement_value;

                                                    const hasEndDateChange =
                                                        prevAmendment &&
                                                        amendment.agreement_end_date !==
                                                            prevAmendment.agreement_end_date;

                                                    const hasChanges =
                                                        hasValueChange ||
                                                        hasEndDateChange;

                                                    // Check if this is the current version
                                                    const isCurrentVersion =
                                                        amendment.amendment_number ===
                                                        grant.latest_amendment_number;

                                                    return (
                                                        <div
                                                            key={index}
                                                            className="relative pl-12 lg:pl-16"
                                                        >
                                                            {/* Timeline dot */}
                                                            <div
                                                                className={cn(
                                                                    "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                                                    amendment.amendment_number ===
                                                                        0
                                                                        ? "border-blue-500 bg-white"
                                                                        : isCurrentVersion
                                                                        ? "border-green-500 bg-white"
                                                                        : "border-amber-500 bg-white"
                                                                )}
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        amendment.amendment_number ===
                                                                            0
                                                                            ? "bg-blue-500"
                                                                            : isCurrentVersion
                                                                            ? "bg-green-500"
                                                                            : "bg-amber-500"
                                                                    )}
                                                                ></div>
                                                            </div>

                                                            {/* Amendment card */}
                                                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                                                                <div className="p-3 lg:p-4">
                                                                    <div className="flex justify-between items-start">
                                                                        <div>
                                                                            <h4
                                                                                className={cn(
                                                                                    "text-sm font-medium",
                                                                                    amendment.amendment_number ===
                                                                                        0
                                                                                        ? "text-blue-600"
                                                                                        : isCurrentVersion
                                                                                        ? "text-green-600"
                                                                                        : "text-amber-600"
                                                                                )}
                                                                            >
                                                                                {amendment.amendment_number ===
                                                                                0
                                                                                    ? "Original Agreement"
                                                                                    : `Amendment ${amendment.amendment_number}`}
                                                                                {isCurrentVersion &&
                                                                                    " • Current"}
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

                                                                {/* Changes section - only show if there are actual changes */}
                                                                {(hasChanges ||
                                                                    amendment.additional_information_en) &&
                                                                    prevAmendment && (
                                                                        <div className="border-t border-slate-300 px-4 py-3 bg-gray-50 rounded-b-lg">
                                                                            {hasChanges && (
                                                                                <>
                                                                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                                                                        Registered
                                                                                        changes
                                                                                        from
                                                                                        previous
                                                                                        version:
                                                                                    </p>
                                                                                    <div className="space-y-2 text-sm">
                                                                                        {/* Amount change */}
                                                                                        {hasValueChange && (
                                                                                            <div className="flex items-start">
                                                                                                <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0 text-gray-400" />
                                                                                                <span className="text-gray-600">
                                                                                                    Funding
                                                                                                    changed
                                                                                                    from
                                                                                                    <span className="font-medium mx-1">
                                                                                                        {formatCurrency(
                                                                                                            prevAmendment.agreement_value
                                                                                                        )}
                                                                                                    </span>
                                                                                                    to
                                                                                                    <span
                                                                                                        className={cn(
                                                                                                            "font-medium mx-1",
                                                                                                            amendment.agreement_value >
                                                                                                                prevAmendment.agreement_value
                                                                                                                ? "text-green-600"
                                                                                                                : "text-amber-600"
                                                                                                        )}
                                                                                                    >
                                                                                                        {formatCurrency(
                                                                                                            amendment.agreement_value
                                                                                                        )}
                                                                                                        {amendment.agreement_value >=
                                                                                                        prevAmendment.agreement_value
                                                                                                            ? ` (+${formatCurrency(
                                                                                                                  amendment.agreement_value -
                                                                                                                      prevAmendment.agreement_value
                                                                                                              )})`
                                                                                                            : ` (-${formatCurrency(
                                                                                                                  prevAmendment.agreement_value -
                                                                                                                      amendment.agreement_value
                                                                                                              )})`}
                                                                                                    </span>
                                                                                                </span>
                                                                                            </div>
                                                                                        )}

                                                                                        {/* End date change */}
                                                                                        {hasEndDateChange && (
                                                                                            <div className="flex items-start">
                                                                                                <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0 text-gray-400" />
                                                                                                <span className="text-gray-600">
                                                                                                    End
                                                                                                    date
                                                                                                    {new Date(
                                                                                                        amendment.agreement_end_date
                                                                                                    ) >
                                                                                                    new Date(
                                                                                                        prevAmendment.agreement_end_date
                                                                                                    )
                                                                                                        ? " extended from"
                                                                                                        : " changed from"}
                                                                                                    <span className="font-medium mx-1">
                                                                                                        {formatDate(
                                                                                                            prevAmendment.agreement_end_date
                                                                                                        )}
                                                                                                    </span>
                                                                                                    to
                                                                                                    <span className="font-medium mx-1">
                                                                                                        {formatDate(
                                                                                                            amendment.agreement_end_date
                                                                                                        )}
                                                                                                    </span>
                                                                                                    {new Date(
                                                                                                        amendment.agreement_end_date
                                                                                                    ) !==
                                                                                                        new Date(
                                                                                                            prevAmendment.agreement_end_date
                                                                                                        ) && (
                                                                                                        <>
                                                                                                            {" "}
                                                                                                            (
                                                                                                            {formatDateDiff(
                                                                                                                prevAmendment.agreement_end_date,
                                                                                                                amendment.agreement_end_date
                                                                                                            )}

                                                                                                            )
                                                                                                        </>
                                                                                                    )}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                </>
                                                                            )}

                                                                            {/* Additional information section */}
                                                                            {amendment.additional_information_en && (
                                                                                <div
                                                                                    className={cn(
                                                                                        hasChanges &&
                                                                                            "mt-3 pt-3 border-t border-gray-200"
                                                                                    )}
                                                                                >
                                                                                    <p className="text-xs font-medium text-gray-600 mb-2">
                                                                                        Additional
                                                                                        Information:
                                                                                    </p>
                                                                                    <div className="text-sm text-gray-600">
                                                                                        {
                                                                                            amendment.additional_information_en
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            );
                                        })()}
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

                                    {hasAmendments && amendments.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2 lg:gap-4 lg:text-sm text-center">
                                            <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                                                <p className="text-gray-500 text-xs">
                                                    Original Value
                                                </p>
                                                <p className="text-gray-900 font-medium text-md lg:text-lg">
                                                    {formatCurrency(
                                                        amendments[
                                                            amendments.length -
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
                                                            amendments[
                                                                amendments.length -
                                                                    1
                                                            ].agreement_value
                                                            ? "text-green-600"
                                                            : grant.agreement_value <
                                                              amendments[
                                                                  amendments.length -
                                                                      1
                                                              ].agreement_value
                                                            ? "text-amber-600"
                                                            : "text-gray-900"
                                                    )}
                                                >
                                                    {grant.agreement_value !==
                                                    amendments[
                                                        amendments.length - 1
                                                    ].agreement_value ? (
                                                        grant.agreement_value >=
                                                        amendments[
                                                            amendments.length -
                                                                1
                                                        ].agreement_value ? (
                                                            <>
                                                                +
                                                                {formatCurrency(
                                                                    grant.agreement_value -
                                                                        amendments[
                                                                            amendments.length -
                                                                                1
                                                                        ]
                                                                            .agreement_value
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                -
                                                                {formatCurrency(
                                                                    amendments[
                                                                        amendments.length -
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
                                            {`No amendment history available for this grant.
                                            Current value:
                                                ${formatCurrency(
                                                    grant.agreement_value
                                                )}`}
                                        </div>
                                    )}
                                </div>

                                {/* TrendVisualizer for Funding History */}
                                {hasAmendments && amendments.length > 0 && (
                                    <TrendVisualizer
                                        grants={[grant]}
                                        amendmentsHistory={amendments}
                                        viewContext="custom"
                                        height={250}
                                        initialChartType={"line"}
                                        initialMetricType="funding"
                                        availableGroupings={["amendment"]}
                                        className="mt-4"
                                    />
                                )}
                            </div>
                        )}
                    </TabContent>
                </div>
            </div>
        </Card>
    );
};
