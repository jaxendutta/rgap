// ============================================================================
// EntityCard Component
// Displays Institute or Recipient cards with proper type handling
// ============================================================================
"use client";

import {
    MapPin,
    University,
    Users,
    BookMarked,
    ArrowUpRight,
    ChevronLeft,
    SquareUser,
    Landmark,
    Calendar,
    CircleDollarSign,
    HandCoins,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCSV, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import BookmarkButton from "@/components/bookmarks/BookmarkButton";
import {
    InstituteWithStats,
    RecipientWithStats,
    EntityType,
    RECIPIENT_TYPE_LABELS,
    isInstitute,
    isRecipient
} from "@/types/database";

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface EntityCardProps {
    entity: InstituteWithStats | RecipientWithStats;
    entityType: EntityType;

    // Optional overrides for aggregated data (if not in entity)
    grantsCount?: number;
    totalFunding?: number;
    latestGrantDate?: string;
    recipientsCount?: number; // For institutes only

    // Error handling
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;

    className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const EntityCard = ({
    entity,
    entityType,
    grantsCount,
    totalFunding,
    latestGrantDate,
    recipientsCount,
    isError = false,
    errorMessage = "Unable to load data",
    onRetry,
    className,
}: EntityCardProps) => {
    const router = useRouter();

    // ============================================================================
    // DERIVE ENTITY PROPERTIES
    // ============================================================================

    const isInstituteType = entityType === "institute" && isInstitute(entity);
    const isRecipientType = entityType === "recipient" && isRecipient(entity);

    // Get basic entity info
    const id = isInstituteType ? entity.institute_id : (isRecipientType ? entity.recipient_id : -1);
    const name = isInstituteType ? entity.name : (isRecipientType ? entity.legal_name : "");

    // Get entity type label
    const typeLabel = isInstituteType
        ? "Academic Institution"
        : isRecipientType && (entity as RecipientWithStats).type
            ? RECIPIENT_TYPE_LABELS[(entity as RecipientWithStats).type as keyof typeof RECIPIENT_TYPE_LABELS] || "Unknown"
            : "Unknown";

    // ============================================================================
    // LOCATION DATA
    // For Recipients: location comes from their linked Institute (pre-fetched by API)
    // For Institutes: location is directly on the entity
    // ============================================================================

    const location = formatCSV([
        entity.city,
        entity.province,
        entity.country
    ].filter(Boolean) as string[]);

    // ============================================================================
    // INSTITUTE INFO (for Recipients only)
    // ============================================================================

    const instituteInfo = isRecipientType && entity.institute_id
        ? {
            id: entity.institute_id,
            name: entity.research_organization_name || "Unknown Institute",
        }
        : null;

    // ============================================================================
    // AGGREGATED STATISTICS
    // Use props if provided, otherwise use entity fields
    // ============================================================================

    const grants = grantsCount ?? entity.grant_count ?? 0;
    const funding = totalFunding ?? entity.total_funding ?? 0;
    const latestDate = latestGrantDate ?? entity.latest_grant_date;

    // Recipients count (only for institutes)
    const recipients = isInstituteType
        ? (recipientsCount ?? entity.recipient_count ?? entity.total_recipients ?? 0)
        : null;

    // ============================================================================
    // ERROR STATE
    // ============================================================================

    if (isError) {
        return (
            <Card className={cn("p-4 border-red-200 bg-red-50", className)}>
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            leftIcon={ChevronLeft}
                            onClick={() => router.back()}
                        >
                            Back
                        </Button>
                        {onRetry && (
                            <Button variant="primary" onClick={onRetry}>
                                Try Again
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    // ============================================================================
    // METADATA ITEMS (Institute link, location, type)
    // ============================================================================

    const metadataItems = [];

    // Show institute link for recipients
    if (instituteInfo?.name) {
        metadataItems.push({
            icon: University,
            text: instituteInfo.name,
            link: `/institutes/${instituteInfo.id}`,
        });
    }

    // Show location if available
    if (location) {
        metadataItems.push({
            icon: MapPin,
            text: location,
        });
    }

    // Show entity type
    if (typeLabel) {
        metadataItems.push({
            icon: entityType === "institute" ? Landmark : SquareUser,
            text: typeLabel,
        });
    }

    // ============================================================================
    // STATISTICS
    // ============================================================================

    const statItems = isInstituteType
        ? [
            {
                label: "Recipients",
                value: recipients ? recipients.toLocaleString() : "N/A",
                icon: Users,
            },
            {
                label: "Grants",
                value: grants ? grants.toLocaleString() : "N/A",
                icon: BookMarked,
            },
            {
                label: "Total Funding",
                value: funding ? formatCurrency(funding) : "N/A",
                icon: CircleDollarSign,
            },
        ]
        : [
            {
                label: "Grants",
                value: grants ? grants.toLocaleString() : "N/A",
                icon: BookMarked,
            },
            {
                label: "Latest Grant",
                value: latestDate ? new Date(latestDate).toLocaleDateString() : "N/A",
                icon: Calendar,
            },
            {
                label: "Total Funding",
                value: funding ? formatCurrency(funding) : "N/A",
                icon: HandCoins,
            },
        ];

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <Card
            className={cn(
                "p-4 hover:border-gray-300 transition-all duration-200 hover:shadow-sm",
                className
            )}
        >
            {/* Header: Entity name + Bookmark button */}
            <div className="flex justify-between items-start mb-3">
                <Link
                    href={`/${entityType === "institute" ? "institutes" : "recipients"}/${id}`}
                    className="text-lg font-medium hover:text-blue-600 transition-colors group flex items-start max-w-[90%]"
                >
                    <span className="line-clamp-2">{name}</span>
                    <ArrowUpRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </Link>

                <BookmarkButton
                    entityType={entityType}
                    entityId={id}
                    isBookmarked={entity.is_bookmarked ?? false}
                    variant="ghost"
                    showLabel={false}
                />
            </div>

            {/* Metadata (Institute, Location, Type) */}
            {metadataItems.length > 0 && (
                <div className="space-y-1 mb-3">
                    {metadataItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                                <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                                {item.link ? (
                                    <Link
                                        href={item.link}
                                        className="hover:text-blue-600 transition-colors truncate"
                                    >
                                        {item.text}
                                    </Link>
                                ) : (
                                    <span className="truncate">{item.text}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-100">
                {statItems.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="text-center">
                            <div className="flex justify-center items-center mb-1 gap-1">
                                <Icon className="h-3 w-3 text-gray-500" />
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                            
                            <div className="text-sm font-medium text-gray-900">{stat.value}</div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default EntityCard;
