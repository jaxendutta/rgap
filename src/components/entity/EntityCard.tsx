// ============================================================================
// EntityCard Component
// Displays Institute or Recipient cards with proper type handling
// ============================================================================
"use client";

import {
    LuMapPin,
    LuUniversity,
    LuUsers,
    LuBookMarked,
    LuArrowUpRight,
    LuChevronLeft,
    LuSquareUser,
    LuLandmark,
    LuCalendar,
    LuCircleDollarSign,
    LuHandCoins,
} from "react-icons/lu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCSV, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
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
                            leftIcon={LuChevronLeft}
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
            icon: LuUniversity,
            text: instituteInfo.name,
            link: `/institutes/${instituteInfo.id}`,
        });
    }

    // Show location if available
    if (location) {
        metadataItems.push({
            icon: LuMapPin,
            text: location,
        });
    }

    // Show entity type
    if (typeLabel) {
        metadataItems.push({
            icon: entityType === "institute" ? LuLandmark : LuSquareUser,
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
                icon: LuUsers,
            },
            {
                label: "Grants",
                value: grants ? grants.toLocaleString() : "N/A",
                icon: LuBookMarked,
            },
            {
                label: "Total Funding",
                value: funding ? formatCurrency(funding) : "N/A",
                icon: LuCircleDollarSign,
            },
        ]
        : [
            {
                label: "Grants",
                value: grants ? grants.toLocaleString() : "N/A",
                icon: LuBookMarked,
            },
            {
                label: "Latest Grant",
                value: latestDate ? new Date(latestDate).toLocaleDateString('en-CA', { timeZone: 'UTC' }) : "N/A",
                icon: LuCalendar,
            },
            {
                label: "Total Funding",
                value: funding ? formatCurrency(funding) : "N/A",
                icon: LuHandCoins,
            },
        ];

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
        <Card
            className={cn(
                "py-3 px-4 hover:border-gray-300 transition-all duration-200 hover:shadow-sm",
                className
            )}
        >
            {/* Header: Entity name + Bookmark button */}
            <div className="flex justify-between items-center gap-2">
                <Link
                    href={`/${entityType === "institute" ? "institutes" : "recipients"}/${id}`}
                    className="text-sm md:text-base font-medium hover:text-blue-600 transition-colors group flex items-start max-w-[90%]"
                >
                    <span className="line-clamp-2">{name}</span>
                    <LuArrowUpRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
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
                <div className="flex flex-wrap gap-2 mt-1.5">
                    {metadataItems.map((item, index) => (
                        <Tag
                            key={index}
                            icon={item.icon}
                            text={item.text}
                            size="sm"
                            variant="outline"
                            className={`w-fit ${item.link ? "text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer" : ""}`}
                            onClick={item.link ? () => router.push(item.link!) : undefined}
                        />
                    ))}
                </div>
            )}

            {/* Statistics */}
            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                {statItems.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="text-center px-2 md:px-4">
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
