'use client';

import { useState } from "react";
import { LucideIcon, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { formatCSV } from "@/lib/format";
import { EntityType } from "@/types/database";
import { Tag, Tags } from "@/components/ui/Tag";
import Link from "next/link";

const LocationMap = dynamic(() => import('@/components/ui/LocationMap'), {
  ssr: false, // This is crucial for Leaflet!
  loading: () => (
    <div className="h-[300px] w-full bg-slate-100 flex items-center justify-center rounded-lg">
       <span className="text-slate-400 text-sm">Loading Map...</span>
    </div>
  ),
});

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
    entityType?: EntityType;
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
    const hasLocationData = !!location && location.trim() !== "";

    return (
        <div className="px-4 py-6 lg:px-6 lg:py-8 border-b border-gray-100/50">
            <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        </div>
                        <div>
                            <h1 className="text-xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-gray-500 mt-1 font-medium">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 self-end lg:self-start">
                        {hasLocationData && (
                            <Button
                                variant="outline"
                                leftIcon={MapPin}
                                rightIcon={showMap ? ChevronUp : ChevronDown}
                                size="sm"
                                onClick={() => setShowMap(!showMap)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                {formatCSV([location].filter(Boolean) as string[])}
                            </Button>
                        )}

                        {actions.map((action, index) => (
                            <Button
                                key={index}
                                variant={action.variant || "outline"}
                                leftIcon={action.icon}
                                size="sm"
                                onClick={action.onClick}
                            >
                                {action.label}
                            </Button>
                        ))}

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

                {metadata.length > 0 && (
                    <div className="mt-4">
                        <Tags>
                            {metadata.map((item, index) => (
                                item.href ? (
                                    <Link key={index} href={item.href} passHref>
                                        <Tag icon={item.icon} variant="link" text={item.text} />
                                    </Link>
                                ) : (
                                    <Tag key={index} icon={item.icon} variant="outline" text={item.text} />
                                )
                            ))}
                        </Tags>
                    </div>
                )}

                {hasLocationData && (
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            showMap ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
                        )}
                    >
                        <div className="border border-slate-200 rounded-lg overflow-hidden bg-gray-50">
                            <div className="p-4">
                                <LocationMap title={title} location={location} height={300} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityHeader;
