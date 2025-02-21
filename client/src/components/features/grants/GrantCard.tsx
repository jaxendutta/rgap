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
} from "lucide-react";
import { formatSentenceCase } from "@/utils/format";

interface GrantCardProps {
    grant: ResearchGrant;
    onBookmark?: () => void;
}

export const GrantCard = ({ grant, onBookmark }: GrantCardProps) => (
    <Card isHoverable className="p-4 relative">
        {onBookmark && (
            <button
                onClick={onBookmark}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
                <BookmarkPlus className="h-5 w-5" />
            </button>
        )}

        <div className="pr-8">
            {/* Mobile: Stack vertically, Desktop: Side by side */}
            <div className="flex flex-col lg:flex-row lg:justify-between gap-2 lg:gap-6">
                {/* Left Column - Grant Details */}
                <div className="flex-1 lg:max-w-[80%]">
                    {/* Recipient Name */}
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
                        <div className="lg:hidden">
                            <span className="font-medium text-lg">
                                {formatCurrency(grant.agreement_value)}
                            </span>
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

                    {/* Grant Title */}
                    <p className="text-gray-600 flex items-start">
                        <BookMarked className="flex-shrink-0 h-4 w-4 mt-1 mr-1.5" />
                        <span className="flex-1">
                            {formatSentenceCase(grant.agreement_title_en)}
                        </span>
                    </p>

                    {/* Reference Number & Location - Mobile Only */}
                    <div className="flex flex-col lg:hidden text-sm text-gray-500 pt-1">
                        <div className="flex items-center">
                            <Database className="flex-shrink-0 h-3 w-3 mr-1.5" />
                            {grant.ref_number} • {grant.org}
                        </div>
                        <div className="flex items-center mt-1">
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
                            <span className="mx-2">•</span>
                            <Calendar className="flex-shrink-0 h-3 w-3 mr-1.5" />
                            <span>
                                {formatDate(grant.agreement_start_date)}
                            </span>
                        </div>
                    </div>

                    {/* Reference Number - Desktop Only */}
                    <div className="hidden lg:block">
                        <p className="text-sm text-gray-500">
                            <Database className="inline-block h-3 w-3 ml-0.5 mr-1.5 mb-1" />
                            {grant.ref_number}
                        </p>
                    </div>
                </div>

                {/* Right Column - Hidden on mobile */}
                <div className="hidden lg:block text-right">
                    <p className="font-medium text-lg">
                        {formatCurrency(grant.agreement_value)}
                    </p>
                    <p className="text-gray-600">{grant.org}</p>
                    <p className="text-sm text-gray-500 flex justify-end items-center">
                        {(grant.city && grant.city.toUpperCase() !== "N/A") ||
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
                                        grant.country.toUpperCase() !== "N/A"
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
                        <span>{formatDate(grant.agreement_start_date)}</span>
                        <span className="w-0.5 h-3 bg-gray-200"></span>
                        <span>{formatDate(grant.agreement_end_date)}</span>
                    </div>
                </div>
            </div>
        </div>
    </Card>
);
