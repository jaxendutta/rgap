// src/components/features/grants/GrantCard.tsx
'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

import { Grant, GrantAmendment, GrantWithDetails } from "@/types/database";
import { Card } from "@/components/ui/Card";
import Tag, { Tags } from "@/components/ui/Tag";
import BookmarkButton from "@/components/bookmarks/BookmarkButton";
import Tabs, { TabContent, TabItem } from "@/components/ui/Tabs";
import { TrendVisualizer } from "@/components/visualizations/TrendVisualizer";

import {
    formatCSV,
    formatCurrency,
    formatDate,
    formatDateDiff,
} from "@/lib/format";
import { cn } from "@/lib/utils";

// --- Types ---

interface GrantCardProps {
    grant: GrantWithDetails;
    isBookmarked?: boolean;
}

type TabId = "details" | "versions" | "funding";

// --- Helper Functions ---

const hasValue = (value: unknown): boolean => {
    return !!value && String(value).trim() !== "";
};

const RenderChangeIndicator = ({ current, previous }: { current: number; previous: number }) => {
    const diff = current - previous;
    if (diff === 0) return null;

    const isPositive = diff > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700";

    return (
        <span className={cn("inline-flex items-start ml-2 px-2 py-0.5 rounded text-xs font-medium", colorClass)}>
            <Icon className={cn("h-3 w-3 mr-1 shrink-0", isPositive ? "mt-0.5" : "mt-1")} />
            {isPositive ? "+" : ""}
            {formatCurrency(diff)}
        </span>
    );
};

// --- Sub-components ---

const GrantHeader = ({ grant, isBookmarked }: { grant: GrantWithDetails; isBookmarked: boolean }) => {
    const router = useRouter();

    return (
        <div className="flex flex-col lg:flex-row gap-2 lg:gap-6">
            <div className="flex-1 max-w-full">
                <div className="flex items-center justify-between gap-2 mb-2 lg:mb-1">
                    <Link
                        href={`/recipients/${grant.recipient_id}`}
                        className="flex text-lg font-medium hover:text-blue-700 transition-colors gap-1.5 group"
                        aria-label={`View profile for recipient ${grant.legal_name}`}
                    >
                        <GraduationCap className="h-5 w-5 mt-1 align-text-bottom flex-shrink-0" />
                        <span className="inline-block">
                            {grant.legal_name}
                            <ArrowUpRight className="inline-block h-4 w-4 ml-1 align-text-bottom opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all" />
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Tag
                            icon={Calendar1}
                            size="md"
                            variant="outline"
                            className="hidden lg:flex"
                            text={formatDate(grant.agreement_start_date)}
                        />
                        <span className="font-medium text-lg lg:text-xl">
                            {formatCurrency(grant.agreement_value)}
                        </span>
                        <BookmarkButton
                            entityId={grant.grant_id}
                            entityType="grant"
                            isBookmarked={isBookmarked}
                            size="md"
                            showLabel={false}
                        />
                    </div>
                </div>

                <Tags spacing="normal">
                    <Tag
                        icon={University}
                        size="md"
                        variant="link"
                        onClick={() => router.push(`/institutes/${grant.institute_id}`)}
                        text={grant.name || "Unknown Institute"}
                        className="group w-full lg:w-auto"
                    />
                    <Tag
                        icon={BookMarked}
                        size="md"
                        variant="outline"
                        className={cn(
                            !hasValue(grant.agreement_title_en) && "text-gray-400 italic",
                            "w-full lg:w-min"
                        )}
                        text={grant.agreement_title_en || "No Agreement Title Record Found"}
                    />
                </Tags>
            </div>
        </div>
    );
};

const MetadataTags = ({ grant }: { grant: GrantWithDetails }) => {
    const tags = useMemo(() => [
        { icon: Database, text: grant.ref_number },
        {
            icon: MapPin,
            text: formatCSV([grant.city, grant.province, grant.country].filter((v): v is string => !!v)),
            hide: !(
                (grant.city && grant.city.toUpperCase() !== "N/A") ||
                (grant.province && grant.province.toUpperCase() !== "N/A") ||
                (grant.country && grant.country.toUpperCase() !== "N/A")
            ),
        },
        {
            icon: Calendar,
            text: `${formatDate(new Date(grant.agreement_start_date))} → ${grant.agreement_end_date ? formatDate(new Date(grant.agreement_end_date)) : "N/A"
                }`,
        },
        {
            icon: Hourglass,
            text: grant.agreement_end_date
                ? formatDateDiff(grant.agreement_start_date, grant.agreement_end_date)
                : "One-time payment",
        },
        { icon: Landmark, text: grant.org },
    ].filter((tag) => !tag.hide), [grant]);

    return (
        <div className="mt-1.5">
            <Tags spacing="tight">
                {tags.map((tag, index) => (
                    <Tag key={index} icon={tag.icon} size="sm" variant="default" text={tag.text} />
                ))}
            </Tags>
        </div>
    );
};

const InfoRow = ({ label, value, placeholder, valueClassName, checkValue }: { label: string; value: any; placeholder?: string; valueClassName?: string; checkValue?: (v: any) => boolean }) => {
    const isValid = checkValue ? checkValue(value) : (value !== null && value !== undefined && value !== "");
    const displayValue = isValid ? value : placeholder;
    const isPlaceholder = !isValid && placeholder;

    if (!displayValue && !placeholder) return null;

    return (
        <div className="grid grid-cols-12 gap-2">
            <span className="col-span-5 text-gray-500 self-start">{label}</span>
            <span className={cn("col-span-7", valueClassName, isPlaceholder ? "text-gray-400 italic" : "text-gray-800")}>
                {displayValue}
            </span>
        </div>
    );
};

const VersionsTab = ({ amendments, currentAmendmentNumber }: { amendments: any[]; currentAmendmentNumber: number }) => (
    <div>
        <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-xl">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Layers className="h-4 w-4 mr-1.5" />
                Version Timeline
            </h3>
            <div className="grid grid-cols-3 gap-2 lg:gap-4 text-center">
                <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                    <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">Total Versions</h4>
                    <p className="text-sm lg:text-md font-semibold text-gray-900">{amendments.length}</p>
                </div>
                {amendments.length > 0 && (
                    <>
                        <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                            <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">First Version</h4>
                            <p className="text-sm lg:text-md font-semibold text-gray-900">
                                {formatDate(amendments[amendments.length - 1].agreement_start_date)}
                            </p>
                        </div>
                        <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                            <h4 className="text-xs lg:text-sm font-medium text-gray-500 mb-1">Latest Version</h4>
                            <p className="text-sm lg:text-md font-semibold text-gray-900">
                                {formatDate(amendments[0].amendment_date || amendments[0].agreement_start_date)}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>

        <div className="relative pt-4 lg:pt-6 pb-4">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6 lg:space-y-8">
                {amendments.map((amendment, index) => {
                    const prevAmendment = amendments[index + 1];
                    const hasValueChange = prevAmendment && amendment.agreement_value !== prevAmendment.agreement_value;
                    const hasEndDateChange = prevAmendment && amendment.agreement_end_date !== prevAmendment.agreement_end_date;
                    const hasChanges = hasValueChange || hasEndDateChange;
                    const isCurrentVersion = amendment.amendment_number === currentAmendmentNumber;

                    return (
                        <div key={index} className="relative pl-12 lg:pl-16">
                            <div className={cn("absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                                amendment.amendment_number === 0 ? "border-blue-500 bg-white" : isCurrentVersion ? "border-green-500 bg-white" : "border-amber-500 bg-white")}>
                                <div className={cn("w-2 h-2 rounded-full",
                                    amendment.amendment_number === 0 ? "bg-blue-500" : isCurrentVersion ? "bg-green-500" : "bg-amber-500")}></div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                                <div className="p-3 lg:p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={cn("text-sm font-medium",
                                                amendment.amendment_number === 0 ? "text-blue-600" : isCurrentVersion ? "text-green-600" : "text-amber-600")}>
                                                {amendment.amendment_number === 0 ? "Original Agreement" : `Amendment ${amendment.amendment_number}`}
                                                {isCurrentVersion && " • Current"}
                                            </h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {amendment.amendment_date ? formatDate(amendment.amendment_date) : formatDate(amendment.agreement_start_date)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatCurrency(amendment.agreement_value)}</p>
                                        </div>
                                    </div>
                                </div>

                                {(hasChanges || amendment.additional_information_en) && prevAmendment && (
                                    <div className="border-t border-slate-300 px-4 py-3 bg-gray-50 rounded-b-lg">
                                        {hasChanges && (
                                            <>
                                                <p className="text-xs font-medium text-gray-600 mb-2">Registered changes from previous version:</p>
                                                <div className="space-y-2 text-sm">
                                                    {hasValueChange && (
                                                        <div className="flex items-start">
                                                            <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                Funding changed from <span className="font-medium mx-1">{formatCurrency(prevAmendment.agreement_value)}</span>
                                                                to <span className={cn("font-medium mx-1", amendment.agreement_value > prevAmendment.agreement_value ? "text-green-600" : "text-amber-600")}>
                                                                    {formatCurrency(amendment.agreement_value)}
                                                                    {amendment.agreement_value >= prevAmendment.agreement_value
                                                                        ? ` (+${formatCurrency(amendment.agreement_value - prevAmendment.agreement_value)})`
                                                                        : ` (-${formatCurrency(prevAmendment.agreement_value - amendment.agreement_value)})`}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    )}
                                                    {hasEndDateChange && (
                                                        <div className="flex items-start">
                                                            <CornerDownRight className="h-3 w-3 mr-2 mt-1 shrink-0 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                End date {new Date(amendment.agreement_end_date) > new Date(prevAmendment.agreement_end_date) ? " extended from" : " changed from"}
                                                                <span className="font-medium mx-1">{formatDate(prevAmendment.agreement_end_date)}</span>
                                                                to <span className="font-medium mx-1">{formatDate(amendment.agreement_end_date)}</span>
                                                                {new Date(amendment.agreement_end_date).getTime() !== new Date(prevAmendment.agreement_end_date).getTime() && (
                                                                    <> ({formatDateDiff(prevAmendment.agreement_end_date, amendment.agreement_end_date)})</>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {amendment.additional_information_en && (
                                            <div className={cn(hasChanges && "mt-3 pt-3 border-t border-gray-200")}>
                                                <p className="text-xs font-medium text-gray-600 mb-2">Additional Information:</p>
                                                <div className="text-sm text-gray-600">{amendment.additional_information_en}</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

const FundingTab = ({ grant, amendments, hasAmendments }: { grant: GrantWithDetails; amendments: GrantAmendment[]; hasAmendments: boolean }) => (
    <div>
        <div className="mb-6 bg-gray-50 p-3 lg:p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-start">
                <LineChart className="h-4 w-4 mr-1.5 mt-0.5 shrink-0" />
                Funding Overview
            </h3>

            {hasAmendments && amendments.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 lg:gap-4 lg:text-sm text-center">
                    <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-xs">Original Value</p>
                        <p className="text-gray-900 font-medium text-md lg:text-lg">
                            {formatCurrency(amendments[amendments.length - 1].agreement_value)}
                        </p>
                    </div>
                    <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-xs">Current Value</p>
                        <p className="text-gray-900 font-medium text-md lg:text-lg">
                            {formatCurrency(grant.agreement_value)}
                        </p>
                    </div>
                    <div className="bg-white py-2 px-3 lg:px-4 rounded-lg shadow-sm">
                        <p className="text-gray-500 text-xs">Total Change</p>
                        <p className={cn("font-medium text-md lg:text-lg",
                            grant.agreement_value > amendments[amendments.length - 1].agreement_value ? "text-green-600" :
                                grant.agreement_value < amendments[amendments.length - 1].agreement_value ? "text-amber-600" : "text-gray-900")}>
                            {grant.agreement_value !== amendments[amendments.length - 1].agreement_value ? (
                                grant.agreement_value >= amendments[amendments.length - 1].agreement_value ? (
                                    <>+{formatCurrency(grant.agreement_value - amendments[amendments.length - 1].agreement_value)}</>
                                ) : (
                                    <>-{formatCurrency(amendments[amendments.length - 1].agreement_value - grant.agreement_value)}</>
                                )
                            ) : (
                                <>No change</>
                            )}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="text-center text-sm text-gray-500 py-4">
                    {`No amendment history available for this grant. Current value: ${formatCurrency(grant.agreement_value)} ${amendments}`}
                </div>
            )}
        </div>

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
);

// --- Main Component ---

export const GrantCard = (grant: GrantWithDetails) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>("details");

    const isBookmarked = grant.is_bookmarked ?? false;
    const amendmentNumber = grant.latest_amendment_number ? Number(grant.latest_amendment_number) : 0;
    const hasAmendments = !!grant.amendments_history && grant.amendments_history.length > 0;

    // Memoize amendments logic
    const amendments = useMemo(() => {
        const list = hasAmendments ? [...(grant.amendments_history || [])] : [];

        if (hasAmendments && grant.latest_amendment_number) {
            const currentNum = Number(grant.latest_amendment_number);
            if (!list.some(a => a.amendment_number === currentNum)) {
                // Use 'as any' to avoid strict type issues if Amendment type is strict about optional fields
                // but we want to display what we have.
                list.push({
                    amendment_number: currentNum,
                    amendment_date: grant.amendment_date || grant.agreement_start_date,
                    agreement_value: grant.agreement_value,
                    agreement_start_date: grant.agreement_start_date,
                    agreement_end_date: grant.agreement_end_date,
                    additional_information_en: grant.additional_information_en,
                } as any);
            }
        }
        return list.sort((a, b) => b.amendment_number - a.amendment_number);
    }, [grant, hasAmendments]);

    const tabs: TabItem[] = useMemo(() => {
        const items: TabItem[] = [
            { id: "details", label: "Details", icon: FileText },
            { id: "funding", label: "Funding Timeline", icon: LineChart },
        ];
        if (hasAmendments) {
            items.splice(1, 0, { id: "versions", label: "Version History", icon: History });
        }
        return items;
    }, [hasAmendments]);

    const hasForeignCurrency = !!grant.foreign_currency_type && !!grant.foreign_currency_value && grant.foreign_currency_value > 0;

    return (
        <Card isHoverable className="p-4 md:py-5 md:px-6 lg:px-7 transition-all duration-300">
            <div>
                <GrantHeader grant={grant} isBookmarked={isBookmarked} />
                <MetadataTags grant={grant} />

                {/* Amendment History Badge */}
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
                            {`${amendmentNumber > 0 ? `Amendment ${amendmentNumber}` : "Original"} • Versions available: ${amendments.length}`}
                        </button>

                        {amendments.length > 1 && amendmentNumber > 0 && (
                            <div className="inline-flex items-center text-xs font-medium rounded-full px-2.5 py-1">
                                {(() => {
                                    const current = amendments.find(a => a.amendment_number === amendmentNumber);
                                    const currentIndex = amendments.findIndex(a => a.amendment_number === amendmentNumber);
                                    const prevAmendment = amendments[currentIndex + 1];

                                    if (current && prevAmendment) {
                                        return <RenderChangeIndicator current={current.agreement_value} previous={prevAmendment.agreement_value} />;
                                    }
                                    return null;
                                })()}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 flex w-full items-center justify-center p-1 text-sm text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", isExpanded && "transform rotate-180")} />
                    <span className="ml-1">{isExpanded ? "Show Less" : "Show More"}</span>
                </button>

                <div className={cn("flex flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "opacity-100 max-h-[2000px] pt-4" : "opacity-0 max-h-0")}>
                    <Tabs
                        className="mb-2"
                        variant="pills"
                        fullWidth={true}
                        activeTab={activeTab}
                        onChange={(id) => setActiveTab(id as TabId)}
                        tabs={tabs}
                    />

                    <TabContent activeTab={activeTab}>
                        {activeTab === "details" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <Card.Header title="Grant Information" icon={Database} size="sm" />
                                    <Card.Content size="sm" className="text-sm text-gray-700 space-y-1">
                                        <InfoRow label="Reference Number" value={grant.ref_number} />
                                        <InfoRow label="Program" value={grant.prog_name_en} placeholder="Not specified" />
                                        <InfoRow label="Agreement Title" value={grant.agreement_title_en || "No Agreement Title Record Found"} placeholder="Not specified" />
                                        {grant.amendment_date && <InfoRow label="Amendment Date" value={formatDate(grant.amendment_date)} />}
                                    </Card.Content>
                                </Card>

                                <Card>
                                    <Card.Header title="Funding Summary" icon={DollarSign} size="sm" />
                                    <Card.Content size="sm" className="text-sm text-gray-700 space-y-1">
                                        <div className="grid grid-cols-12 gap-2 items-center">
                                            <span className="col-span-5 text-gray-500 self-start">Current Value</span>
                                            <div className="col-span-7 flex items-center">
                                                <span className="text-gray-800 font-medium">{formatCurrency(grant.agreement_value)}</span>
                                                {hasAmendments && amendments.length > 1 && (
                                                    <RenderChangeIndicator current={grant.agreement_value} previous={amendments[amendments.length - 1].agreement_value} />
                                                )}
                                            </div>
                                        </div>
                                        <InfoRow
                                            label="Current Version"
                                            value={amendmentNumber > 0 ? `Amendment ${amendmentNumber}` : "Original Agreement"}
                                            valueClassName={amendmentNumber > 0 ? "text-amber-600" : "text-gray-800"}
                                        />
                                        <div className="grid grid-cols-12 gap-2">
                                            <span className="col-span-5 text-gray-500 self-start">Funding Agency</span>
                                            <span className="col-span-7 text-gray-800 break-words">
                                                {grant.org_title_en} &ndash; {grant.org}
                                            </span>
                                        </div>
                                        {hasForeignCurrency && (
                                            <InfoRow label="Foreign Currency" value={`${grant.foreign_currency_type} ${grant.foreign_currency_value?.toLocaleString()}`} />
                                        )}
                                        {hasAmendments && amendments.length > 0 && (
                                            <InfoRow label="Original Value" value={formatCurrency(amendments[amendments.length - 1].agreement_value)} />
                                        )}
                                    </Card.Content>
                                </Card>

                                <Card>
                                    <Card.Header title="Funding Timeline" icon={Calendar} size="sm" />
                                    <Card.Content size="sm" className="text-sm text-gray-700 space-y-1">
                                        <InfoRow label="Start Date" value={formatDate(grant.agreement_start_date)} />
                                        <InfoRow label="End Date" value={formatDate(grant.agreement_end_date)} />
                                        <InfoRow label="Duration" value={grant.agreement_end_date
                                            ? formatDateDiff(grant.agreement_start_date, grant.agreement_end_date)
                                            : "One-time payment"} />
                                    </Card.Content>
                                </Card>

                                <Card>
                                    <Card.Header title="Location" icon={MapPin} size="sm" />
                                    <Card.Content size="sm" className="text-sm text-gray-700 space-y-1">
                                        <InfoRow label="Country" value={grant.country} placeholder="Not specified" checkValue={v => !!v && v.toUpperCase() !== "N/A"} />
                                        <InfoRow label="Province/State" value={grant.province} placeholder="Not specified" checkValue={v => !!v && v.toUpperCase() !== "N/A"} />
                                        <InfoRow label="City" value={grant.city} placeholder="Not specified" checkValue={v => !!v && v.toUpperCase() !== "N/A"} />
                                    </Card.Content>
                                </Card>

                                <Card>
                                    <Card.Header title={grant.prog_name_en || "Program Information"} subtitle={grant.prog_name_en ? "Program Information" : "Unspecified Program Name"} icon={BookOpen} size="sm" />
                                    <Card.Content size="sm" className="text-sm text-gray-700 p-4">
                                        {hasValue(grant.prog_purpose_en) ? grant.prog_purpose_en : "Program purpose not specified"}
                                    </Card.Content>
                                </Card>

                                <Card>
                                    <Card.Header title={grant.agreement_title_en || "Agreement Description"} subtitle={grant.agreement_title_en ? "Agreement Description" : "Unspecified Agreement Description"} icon={FileText} size="sm" />
                                    <Card.Content size="sm" className="text-sm text-gray-700 p-4">
                                        {grant.description_en || "Agreement description not specified"}
                                    </Card.Content>
                                </Card>

                                {hasValue(grant.expected_results_en) && (
                                    <Card>
                                        <Card.Header title="Expected Results" icon={AlertCircle} size="sm" />
                                        <Card.Content size="sm" className="text-sm text-gray-700 p-4">
                                            {grant.expected_results_en}
                                        </Card.Content>
                                    </Card>
                                )}
                            </div>
                        )}

                        {activeTab === "versions" && hasAmendments && (
                            <VersionsTab amendments={amendments} currentAmendmentNumber={amendmentNumber} />
                        )}

                        {activeTab === "funding" && (
                            <FundingTab grant={grant} amendments={amendments} hasAmendments={hasAmendments} />
                        )}
                    </TabContent>
                </div>
            </div>
        </Card>
    );
};
