// src/components/common/ui/EntityCard.tsx
import { Link, useNavigate } from "react-router-dom";
import {
    BookmarkPlus,
    BookmarkCheck,
    MapPin,
    University,
    Users,
    BookMarked,
    GraduationCap,
    ArrowUpRight,
    ChevronLeft,
    SquareUser,
    Landmark,
    Calendar,
    CircleDollarSign,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Card } from "@/components/common/ui/Card";
import { Button } from "@/components/common/ui/Button";
import Tag, { TagGroup } from "@/components/common/ui/Tag";
import { Institute, Recipient } from "@/types/models";
import { cn } from "@/utils/cn";

export type EntityType = "institute" | "recipient";

interface EntityCardProps {
    entity: Institute | Recipient;
    entityType: EntityType;
    grantsCount?: number;
    totalFunding?: number;
    latestGrantDate?: string;
    firstGrantDate?: string;
    recipientsCount?: number;
    isBookmarked?: boolean;
    onBookmark?: () => void;
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    className?: string;
}

const EntityCard = ({
    entity,
    entityType,
    grantsCount,
    totalFunding,
    latestGrantDate,
    recipientsCount,
    isBookmarked = false,
    onBookmark,
    isError = false,
    errorMessage = "Unable to load data",
    onRetry,
    className,
}: EntityCardProps) => {
    const navigate = useNavigate();

    // Type guards to distinguish between institute and recipient
    const isInstitute = (): boolean => {
        return entityType === "institute";
    };

    // Get entity-specific properties
    const id = isInstitute()
        ? entity.institute_id
        : (entity as Recipient).recipient_id;
    const name = isInstitute()
        ? (entity as Institute).name
        : (entity as Recipient).legal_name;
    const type = isInstitute()
        ? entity.type || "Academic Institution"
        : (entity as Recipient).recipient_type ||
          (entity as Recipient).type ||
          "Organization";

    // For recipients, get their institute info
    const institute =
        !isInstitute() && (entity as Recipient).institute_id
            ? {
                  id: (entity as Recipient).institute_id,
                  name: (entity as Recipient).research_organization_name,
              }
            : null;

    // Location data
    const city = entity.city;
    const province = entity.province;
    const country = entity.country;
    const location = [city, province, country].filter(Boolean).join(", ");

    // Get counts with fallbacks from props
    const grants =
        grantsCount ??
        (entityType === "recipient"
            ? (entity as Recipient).grants_count
            : (entity as Institute).total_grants) ??
        0;
    const funding = totalFunding ?? entity.total_funding ?? 0;
    const recipients = isInstitute()
        ? recipientsCount ?? (entity as Institute).total_recipients ?? 0
        : null;
    const latestDate = latestGrantDate ?? entity.latest_grant_date;

    // Handle error state
    if (isError) {
        return (
            <Card className={cn("p-4 border-red-200 bg-red-50", className)}>
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            icon={ChevronLeft}
                            onClick={() =>
                                navigate(
                                    `/${
                                        entityType === "institute"
                                            ? "institutes"
                                            : "recipients"
                                    }`
                                )
                            }
                        >
                            Back to{" "}
                            {entityType === "institute"
                                ? "Institutes"
                                : "Recipients"}
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

    // Handle error state
    if (isError) {
        return (
            <Card className={cn("p-4 border-red-200 bg-red-50", className)}>
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            icon={ChevronLeft}
                            onClick={() =>
                                navigate(
                                    `/${
                                        entityType === "institute"
                                            ? "institutes"
                                            : "recipients"
                                    }`
                                )
                            }
                        >
                            Back to{" "}
                            {entityType === "institute"
                                ? "Institutes"
                                : "Recipients"}
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

    // Create metadata items
    const metadataItems = [];

    if (institute?.name) {
        metadataItems.push({
            icon: University,
            text: `${institute.name}`,
            link: `/institutes/${institute.id}`,
        });
    }

    if (location) {
        metadataItems.push({
            icon: MapPin,
            text: location,
        });
    }

    if (type) {
        metadataItems.push({
            icon: entityType === "institute" ? Landmark : SquareUser,
            text: type,
        });
    }

    // Define stats for both entity types
    const statItems = isInstitute()
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
                  label: "Last Grant",
                  value: latestDate
                      ? new Date(latestDate).toLocaleDateString()
                      : "N/A",
                  icon: Calendar,
              },
              {
                  label: "Total Funding",
                  value: funding ? formatCurrency(funding) : "N/A",
                  icon: CircleDollarSign,
              },
          ];

    return (
        <Card
            className={cn(
                "p-4 hover:border-gray-300 transition-all duration-200 hover:shadow-sm",
                className
            )}
        >
            {/* Header with Entity Name and Bookmark Button on same line */}
            <div className="flex justify-between items-start mb-3">
                <Link
                    to={`/${
                        entityType === "institute" ? "institutes" : "recipients"
                    }/${id}`}
                    className="text-lg font-medium hover:text-blue-600 transition-colors group flex items-start max-w-[90%]"
                >
                    {entityType === "institute" ? (
                        <University className="h-5 w-5 flex-shrink-0 mr-2 mt-1" />
                    ) : (
                        <GraduationCap className="h-5 w-5 flex-shrink-0 mr-2 mt-1" />
                    )}
                    <span>
                        {name}
                        <ArrowUpRight className="inline-block h-4 w-4 ml-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                </Link>

                {onBookmark && (
                    <button
                        onClick={onBookmark}
                        className={cn(
                            "p-1 rounded-full transition-colors hover:bg-gray-50 flex-shrink-0",
                            isBookmarked
                                ? "text-blue-600 hover:text-blue-700"
                                : "text-gray-400 hover:text-gray-600"
                        )}
                        aria-label={
                            isBookmarked ? "Remove bookmark" : "Add bookmark"
                        }
                    >
                        {isBookmarked ? (
                            <BookmarkCheck className="h-5 w-5" />
                        ) : (
                            <BookmarkPlus className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>

            {/* Metadata Tags - Keep them single line with overflow handling */}
            {metadataItems.length > 0 && (
                <div className="mb-4 overflow-hidden">
                    <TagGroup>
                        {metadataItems.map((item, index) => (
                            <Tag
                                key={index}
                                icon={item.icon}
                                size="sm"
                                pill={true}
                                variant={item.link ? "link" : "outline"}
                                onClick={
                                    item.link
                                        ? () => navigate(item.link)
                                        : undefined
                                }
                            >
                                <span className="truncate max-w-full">
                                    {item.text}
                                </span>
                            </Tag>
                        ))}
                    </TagGroup>
                </div>
            )}

            {/* Stats Section - Adaptive grid layout */}
            <div className="pt-3 border-t">
                <div className="grid grid-cols-3 gap-2">
                    {statItems.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-100 rounded-lg p-2"
                        >
                            <div className="flex items-center text-xs text-blue-700 mb-1">
                                {stat.icon && (
                                    <stat.icon
                                        className={cn("h-3 w-3 mr-1.5")}
                                    />
                                )}
                                {stat.label}
                            </div>
                            <div className="flex items-center font-medium whitespace-nowrap">
                                <span className="truncate">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default EntityCard;
