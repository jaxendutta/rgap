// src/components/common/layout/EntityHeader.tsx
import { useState } from "react";
import { LucideIcon, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/common/ui/Button";
import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { cn } from "@/utils/cn";
import LocationMap from "@/components/common/ui/LocationMap";
import { formatCommaSeparated } from "@/utils/format";
import { Entity } from "@/types/models";
import { Tag, Tags } from "../ui/Tag";

// Define types for metadata and action items
export interface MetadataItem {
    icon: LucideIcon;
    text: string;
    href?: string;
}

export interface ActionButton {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
}

interface EntityHeaderProps {
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    metadata: MetadataItem[];
    actions?: ActionButton[];
    entityType?: keyof Entity;
    entityId?: number;
    location?: string;
    isBookmarked?: boolean;
}

const EntityHeader: React.FC<EntityHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    metadata,
    actions = [],
    entityType,
    entityId,
    location,
    isBookmarked,
}) => {
    const [showMap, setShowMap] = useState(false);

    // Check if we have a location string to display a map
    const hasLocationData = !!location && location.trim() !== "";

    return (
        <div className="px-4 py-6 lg:px-6 lg:py-8 border-b border-gray-200">
            <div className="flex-1 flex flex-col gap-1.5">
                {/* Entity Title */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-gray-500 mt-1">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 self-end lg:self-start">
                        {/* Map toggle button - only show if we have location data */}
                        {hasLocationData && (
                            <Button
                                variant="outline"
                                leftIcon={MapPin}
                                rightIcon={showMap ? ChevronUp : ChevronDown}
                                size="sm"
                                pill={true}
                                onClick={() => setShowMap(!showMap)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                {formatCommaSeparated(
                                    [location].filter(Boolean) as string[]
                                )}
                            </Button>
                        )}

                        {/* Other action buttons */}
                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || "outline"}
                                leftIcon={action.icon}
                                size="sm"
                                pill={true}
                                onClick={action.onClick}
                            >
                                {
                                    <span className="hidden lg:inline">
                                        {action.label}
                                    </span>
                                }
                            </Button>
                        ))}

                        {/* Add BookmarkButton if entityType and entityId are provided */}
                        {entityType && entityId && (
                            <BookmarkButton
                                entityId={entityId}
                                entityType={entityType}
                                size="sm"
                                isBookmarked={isBookmarked}
                            />
                        )}
                    </div>
                </div>

                {/* Metadata */}
                {metadata.length > 0 && (
                    <Tags>
                        {metadata.map((item, index) => (
                            <Tag
                                key={index}
                                icon={item.icon}
                                onClick={
                                    item.href && item.href.trim() !== ""
                                        ? () =>
                                              (window.location.href =
                                                  item.href || "")
                                        : undefined
                                }
                                variant={
                                    item.href && item.href.trim() !== ""
                                        ? "link"
                                        : "outline"
                                }
                                pill={true}
                            >
                                {item.text}
                            </Tag>
                        ))}
                    </Tags>
                )}

                {/* Map section - collapsible */}
                {hasLocationData && (
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            showMap
                                ? "max-h-96 opacity-100 mt-4"
                                : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="border rounded-lg overflow-hidden bg-gray-50">
                            <div className="p-4">
                                <LocationMap
                                    title={title}
                                    location={location}
                                    height={300}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityHeader;
