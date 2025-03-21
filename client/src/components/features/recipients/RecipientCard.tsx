// src/components/features/recipients/RecipientCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
    GraduationCap,
    MapPin,
    BookMarked,
    Building,
    Users,
    DollarSign,
    BookmarkPlus,
    BookmarkCheck,
    ArrowUpRight,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Card } from "@/components/common/ui/Card";
import Tag, { TagGroup } from "@/components/common/ui/Tag";
import { cn } from "@/utils/cn";
import { Recipient } from "@/types/models";

export interface RecipientCardProps {
    recipient: Recipient;
    isBookmarked?: boolean;
    onBookmark?: () => void;
    className?: string;
}

export const RecipientCard: React.FC<RecipientCardProps> = ({
    recipient,
    isBookmarked = false,
    onBookmark,
    className,
}) => {
    const total_funding = recipient.total_funding || 0;
    const grant_count = recipient.grant_count || 0;

    // Format recipient type for display
    const formattedType = recipient.recipient_type
        ? recipient.recipient_type.charAt(0).toUpperCase() +
          recipient.recipient_type.slice(1)
        : recipient.type || "Organization";

    // Generate location string
    const location = [recipient.city, recipient.province, recipient.country]
        .filter(Boolean)
        .join(", ");

    return (
        <Card
            className={cn(
                "p-4 hover:border-gray-300 transition-all dark:border-gray-800 dark:hover:border-gray-700",
                className
            )}
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                {/* Left content - Recipient info */}
                <div className="space-y-2">
                    <div className="flex items-start justify-between w-full lg:w-auto">
                        <Link
                            to={`/recipients/${recipient.recipient_id}`}
                            className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group flex items-center"
                        >
                            <GraduationCap className="h-5 w-5 mr-2 flex-shrink-0 text-blue-600 dark:text-blue-500" />
                            <span>{recipient.legal_name}</span>
                            <ArrowUpRight className="h-4 w-4 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>

                        {/* Mobile bookmark button */}
                        <div className="lg:hidden">
                            {onBookmark && (
                                <button
                                    onClick={onBookmark}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                                >
                                    {isBookmarked ? (
                                        <BookmarkCheck className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                                    ) : (
                                        <BookmarkPlus className="h-5 w-5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Organization */}
                    {recipient.research_organization_name && (
                        <Link
                            to={`/institutes/${recipient.institute_id || "#"}`}
                            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
                        >
                            <Building className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span className="truncate">
                                {recipient.research_organization_name}
                            </span>
                        </Link>
                    )}

                    {/* Location and Type Tags */}
                    <TagGroup spacing="tight" className="mt-2 flex-wrap">
                        {location && (
                            <Tag size="sm" icon={MapPin}>
                                {location}
                            </Tag>
                        )}

                        {formattedType && (
                            <Tag size="sm" variant="primary" icon={Users}>
                                {formattedType}
                            </Tag>
                        )}
                    </TagGroup>
                </div>

                {/* Right content - Stats and bookmark */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start mt-2 lg:mt-0 gap-1 lg:gap-2">
                    {/* Desktop bookmark button */}
                    <div className="hidden lg:block">
                        {onBookmark && (
                            <button
                                onClick={onBookmark}
                                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none"
                            >
                                {isBookmarked ? (
                                    <BookmarkCheck className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                                ) : (
                                    <BookmarkPlus className="h-5 w-5" />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Funding amount */}
                    <div className="flex items-center text-gray-900 dark:text-white">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600 dark:text-green-500" />
                        <span className="font-medium text-lg">
                            {formatCurrency(total_funding)}
                        </span>
                    </div>

                    {/* Grant count */}
                    <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                        <BookMarked className="h-4 w-4 mr-1.5 text-blue-600 dark:text-blue-500" />
                        <span>
                            {grant_count}{" "}
                            {grant_count === 1 ? "grant" : "grants"}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default RecipientCard;
