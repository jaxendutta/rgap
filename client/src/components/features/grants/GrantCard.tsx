import { useState } from "react";
import { ResearchGrant } from "@/types/models";
import { Card } from "@/components/common/ui/Card";
import { formatCurrency, formatDate } from "@/utils/format";
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
    FileEdit,
    Clock,
    AlertCircle,
    Globe,
    History,
} from "lucide-react";
import { formatSentenceCase } from "@/utils/format";
import { cn } from "@/utils/cn";

interface GrantCardProps {
    grant: ResearchGrant;
    onBookmark?: () => void;
}

export const GrantCard = ({ grant, onBookmark }: GrantCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    return (
        <Card isHoverable className="p-4 transition-all duration-300">
            <div>
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row lg:justify-between gap-2 lg:gap-6">
                    {/* Left Column - Grant Details */}
                    <div className="flex-1 lg:max-w-[80%]">
                        {/* Recipient Name with Bookmark button inline */}
                        <div className="flex items-start justify-between lg:justify-start gap-2">
                            <Link
                                to={`/recipients/${grant.recipient_id}`}
                                className="inline-flex items-start text-lg font-medium hover:text-blue-600 transition-colors gap-1.5 group"
                            >
                                <span className="inline-block">
                                    {grant.legal_name}
                                    <ArrowUpRight className="inline-block h-4 w-4 ml-1 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                                </span>
                            </Link>

                            {/* Show amount on mobile, hidden on desktop */}
                            <div className="lg:hidden flex items-center gap-3">
                                <span className="font-medium text-lg">
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

                        {/* Institution */}
                        <Link
                            to={`/institutes/${grant.research_organization_name}`}
                            className="inline-flex items-start text-gray-600 hover:text-blue-600 transition-colors group"
                        >
                            <University className="inline-block flex-shrink-0 h-4 w-4 mr-1.5 mt-1" />
                            <span className="inline-block">
                                {grant.research_organization_name}
                                <ArrowUpRight className="inline-block h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </Link>

                        {/* Grant Title - Handle empty case */}
                        <p className="text-gray-600 flex items-start">
                            <BookMarked
                                className={cn(
                                    "flex-shrink-0 h-4 w-4 mt-1 mr-1.5",
                                    !hasTitle && "text-gray-300"
                                )}
                            />
                            <span
                                className={cn(
                                    "flex-1",
                                    !hasTitle && "text-gray-400 italic"
                                )}
                            >
                                {hasTitle
                                    ? formatSentenceCase(
                                          grant.agreement_title_en
                                      )
                                    : "No Agreement Title Record Found"}
                            </span>
                        </p>

                        {/* Reference Number & Location - Mobile Only */}
                        <div className="flex flex-col lg:hidden text-sm text-gray-500 pt-1">
                            <div className="flex items-start">
                                <Database className="flex-shrink-0 h-3 w-3 mr-1.5 mt-1" />
                                {grant.ref_number} • {grant.org}
                                {amendmentNumber > 0 && (
                                    <>
                                        {" "}
                                        •{" "}
                                        <span className="text-amber-600 ml-1">
                                            Amendment {amendmentNumber}
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-start mt-1">
                                {(grant.city &&
                                    grant.city.toUpperCase() !== "N/A") ||
                                (grant.province &&
                                    grant.province.toUpperCase() !== "N/A") ||
                                (grant.country &&
                                    grant.country.toUpperCase() !== "N/A") ? (
                                    <MapPin className="inline-block h-3 w-3 mr-1 mt-1" />
                                ) : null}
                                <span>
                                    {grant.city &&
                                        grant.city.toUpperCase() !== "N/A" && (
                                            <>
                                                {grant.city}
                                                {(grant.province &&
                                                    grant.province.toUpperCase() !==
                                                        "N/A") ||
                                                (grant.country &&
                                                    grant.country.toUpperCase() !==
                                                        "N/A")
                                                    ? ", "
                                                    : ""}
                                            </>
                                        )}
                                    {grant.province &&
                                        grant.province.toUpperCase() !==
                                            "N/A" && (
                                            <>
                                                {grant.province}
                                                {grant.country &&
                                                grant.country.toUpperCase() !==
                                                    "N/A"
                                                    ? ", "
                                                    : ""}
                                            </>
                                        )}
                                    {grant.country &&
                                        grant.country.toUpperCase() !== "N/A" &&
                                        grant.country}
                                </span>
                                <span className="mx-2">•</span>
                                <Calendar className="flex-shrink-0 h-3 w-3 mr-1.5 mt-1" />
                                <span>
                                    {formatDate(grant.agreement_start_date)}
                                </span>
                            </div>
                        </div>

                        {/* Reference Number - Desktop Only */}
                        <div className="hidden lg:block">
                            <p className="text-sm text-gray-500 flex items-center">
                                <Database className="inline-block h-3 w-3 ml-0.5 mr-1.5" />
                                <span>{grant.ref_number}</span>
                                {amendmentNumber > 0 && (
                                    <span className="text-amber-600 ml-2">
                                        Amendment {amendmentNumber}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Hidden on mobile */}
                    <div className="hidden lg:block text-right">
                        <div className="flex items-center justify-end gap-2">
                            <p className="font-medium text-lg">
                                {formatCurrency(grant.agreement_value)}
                            </p>
                            {onBookmark && (
                                <button
                                    onClick={onBookmark}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    <BookmarkPlus className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <p className="text-gray-600">{grant.org}</p>
                        <p className="text-sm text-gray-500 flex justify-end items-center">
                            {(grant.city &&
                                grant.city.toUpperCase() !== "N/A") ||
                            (grant.province &&
                                grant.province.toUpperCase() !== "N/A") ||
                            (grant.country &&
                                grant.country.toUpperCase() !== "N/A") ? (
                                <MapPin className="inline-block h-3 w-3 mr-1" />
                            ) : null}
                            <span>
                                {grant.city &&
                                    grant.city.toUpperCase() !== "N/A" && (
                                        <>
                                            {grant.city}
                                            {(grant.province &&
                                                grant.province.toUpperCase() !==
                                                    "N/A") ||
                                            (grant.country &&
                                                grant.country.toUpperCase() !==
                                                    "N/A")
                                                ? ", "
                                                : ""}
                                        </>
                                    )}
                                {grant.province &&
                                    grant.province.toUpperCase() !== "N/A" && (
                                        <>
                                            {grant.province}
                                            {grant.country &&
                                            grant.country.toUpperCase() !==
                                                "N/A"
                                                ? ", "
                                                : ""}
                                        </>
                                    )}
                                {grant.country &&
                                    grant.country.toUpperCase() !== "N/A" &&
                                    grant.country}
                            </span>
                        </p>
                        <div className="text-sm text-gray-500 flex justify-end items-center gap-2">
                            <span>
                                {formatDate(grant.agreement_start_date)}
                            </span>
                            <span className="w-0.5 h-3 bg-gray-200"></span>
                            <span>{formatDate(grant.agreement_end_date)}</span>
                        </div>
                    </div>
                </div>

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
                        "grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden transition-all duration-300 ease-in-out",
                        isExpanded
                            ? "opacity-100 max-h-[1000px] mt-4 pt-4 border-t"
                            : "opacity-0 max-h-0"
                    )}
                >
                    {/* Left Column in Expanded View */}
                    <div className="space-y-4">
                        {/* Agreement Details */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FileText className="h-4 w-4 mr-1.5" />
                                Agreement Details
                            </h3>
                            <div className="text-sm space-y-1.5 pl-6">
                                <p>
                                    <span className="text-gray-500">
                                        Reference Number:
                                    </span>{" "}
                                    <span className="text-gray-700">
                                        {grant.ref_number}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-gray-500">
                                        Amendment:
                                    </span>{" "}
                                    <span
                                        className={
                                            amendmentNumber > 0
                                                ? "text-amber-600 font-medium"
                                                : "text-gray-700"
                                        }
                                    >
                                        {amendmentNumber > 0
                                            ? `Amendment ${amendmentNumber}`
                                            : "Original Agreement"}
                                    </span>
                                </p>
                                {grant.amendment_date && (
                                    <p>
                                        <span className="text-gray-500">
                                            Amendment Date:
                                        </span>{" "}
                                        <span className="text-gray-700">
                                            {formatDate(grant.amendment_date)}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <FileEdit
                                    className={cn(
                                        "h-4 w-4 mr-1.5",
                                        !hasDescription && "text-gray-300"
                                    )}
                                />
                                Description
                            </h3>
                            <p
                                className={cn(
                                    "text-sm pl-6",
                                    hasDescription
                                        ? "text-gray-700"
                                        : "text-gray-400 italic"
                                )}
                            >
                                {hasDescription
                                    ? grant.description_en
                                    : "No description available"}
                            </p>
                        </div>

                        {/* Expected Results */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <AlertCircle
                                    className={cn(
                                        "h-4 w-4 mr-1.5",
                                        !hasExpectedResults && "text-gray-300"
                                    )}
                                />
                                Expected Results
                            </h3>
                            <p
                                className={cn(
                                    "text-sm pl-6",
                                    hasExpectedResults
                                        ? "text-gray-700"
                                        : "text-gray-400 italic"
                                )}
                            >
                                {hasExpectedResults
                                    ? grant.expected_results_en
                                    : "No expected results specified"}
                            </p>
                        </div>
                    </div>

                    {/* Right Column in Expanded View */}
                    <div className="space-y-4">
                        {/* Financial Info */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <DollarSign className="h-4 w-4 mr-1.5" />
                                Financial Details
                            </h3>
                            <div className="text-sm space-y-1.5 pl-6">
                                <p>
                                    <span className="text-gray-500">
                                        Agreement Value:
                                    </span>{" "}
                                    <span className="text-gray-700 font-medium">
                                        {formatCurrency(grant.agreement_value)}
                                    </span>
                                </p>

                                {hasForeignCurrency && (
                                    <p>
                                        <span className="text-gray-500">
                                            Foreign Currency:
                                        </span>{" "}
                                        <span className="text-gray-700">
                                            {grant.foreign_currency_type}{" "}
                                            {grant.foreign_currency_value?.toLocaleString()}
                                        </span>
                                    </p>
                                )}

                                <p>
                                    <span className="text-gray-500">
                                        Funding Agency:
                                    </span>{" "}
                                    <span className="text-gray-700">
                                        {grant.owner_org_title || "Unknown"} (
                                        {grant.org})
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Timing Details */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Clock className="h-4 w-4 mr-1.5" />
                                Timeline
                            </h3>
                            <div className="text-sm space-y-1.5 pl-6">
                                <p>
                                    <span className="text-gray-500">
                                        Start Date:
                                    </span>{" "}
                                    <span className="text-gray-700">
                                        {formatDate(grant.agreement_start_date)}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-gray-500">
                                        End Date:
                                    </span>{" "}
                                    <span className="text-gray-700">
                                        {formatDate(grant.agreement_end_date)}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-gray-500">
                                        Duration:
                                    </span>{" "}
                                    <span className="text-gray-700">
                                        {(() => {
                                            try {
                                                // Calculate duration in months
                                                const start = new Date(
                                                    grant.agreement_start_date
                                                );
                                                const end = new Date(
                                                    grant.agreement_end_date
                                                );
                                                const diffMonths =
                                                    (end.getFullYear() -
                                                        start.getFullYear()) *
                                                        12 +
                                                    end.getMonth() -
                                                    start.getMonth();
                                                const years = Math.floor(
                                                    diffMonths / 12
                                                );
                                                const months = diffMonths % 12;

                                                if (years > 0 && months > 0) {
                                                    return `${years} ${
                                                        years === 1
                                                            ? "year"
                                                            : "years"
                                                    } and ${months} ${
                                                        months === 1
                                                            ? "month"
                                                            : "months"
                                                    }`;
                                                } else if (years > 0) {
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
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                <Globe className="h-4 w-4 mr-1.5" />
                                Location
                            </h3>
                            <div className="text-sm space-y-1.5 pl-6">
                                <p>
                                    <span className="text-gray-500">
                                        Country:
                                    </span>{" "}
                                    <span
                                        className={
                                            grant.country &&
                                            grant.country.toUpperCase() !==
                                                "N/A"
                                                ? "text-gray-700"
                                                : "text-gray-400 italic"
                                        }
                                    >
                                        {grant.country &&
                                        grant.country.toUpperCase() !== "N/A"
                                            ? grant.country
                                            : "Not specified"}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-gray-500">
                                        Province/State:
                                    </span>{" "}
                                    <span
                                        className={
                                            grant.province &&
                                            grant.province.toUpperCase() !==
                                                "N/A"
                                                ? "text-gray-700"
                                                : "text-gray-400 italic"
                                        }
                                    >
                                        {grant.province &&
                                        grant.province.toUpperCase() !== "N/A"
                                            ? grant.province
                                            : "Not specified"}
                                    </span>
                                </p>
                                <p>
                                    <span className="text-gray-500">City:</span>{" "}
                                    <span
                                        className={
                                            grant.city &&
                                            grant.city.toUpperCase() !== "N/A"
                                                ? "text-gray-700"
                                                : "text-gray-400 italic"
                                        }
                                    >
                                        {grant.city &&
                                        grant.city.toUpperCase() !== "N/A"
                                            ? grant.city
                                            : "Not specified"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Amendment History */}
                        {amendmentNumber > 0 && grant.amendment_date && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <History className="h-4 w-4 mr-1.5" />
                                    Amendment History
                                </h3>
                                <div className="text-sm pl-6">
                                    <p>
                                        <span className="text-amber-600 font-medium">
                                            Amendment {amendmentNumber}
                                        </span>{" "}
                                        <span className="text-gray-500">
                                            on
                                        </span>{" "}
                                        <span className="text-gray-700">
                                            {formatDate(grant.amendment_date)}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        To view other ammendments of this grant,
                                        search for the same reference number.{" "}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};
