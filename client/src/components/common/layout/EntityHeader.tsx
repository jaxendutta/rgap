// src/components/common/layout/EntityHeader.tsx
import { LucideIcon, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/common/ui/Button";
import { BookmarkButton } from "@/components/features/bookmarks/BookmarkButton";
import { BookmarkType } from "@/types/bookmark";

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
    isBookmarked: boolean;
    onToggleBookmark: () => void;
    entityType?: BookmarkType;
    entityId?: number;
}

const EntityHeader: React.FC<EntityHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    metadata,
    actions = [],
    isBookmarked,
    onToggleBookmark,
    entityType,
    entityId,
}) => {
    return (
        <div className="p-4 lg:p-6">
            <div className="flex flex-col-reverse lg:flex-row lg:justify-between lg:items-start gap-4">
                {/* Left side: Entity Info */}
                <div className="flex-1 flex flex-col gap-3">
                    {/* Entity Title */}
                    <div className="flex items-start gap-2">
                        <Icon className="h-7 w-7 text-blue-600 mt-1 flex-shrink-0" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-gray-500 mt-1">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-1">
                        {metadata.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center text-gray-600"
                            >
                                <item.icon className="h-4 w-4 mr-2" />
                                {item.href ? (
                                    <Link
                                        to={item.href}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {item.text}
                                    </Link>
                                ) : (
                                    <span>{item.text}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex flex-wrap gap-2 self-end lg:self-start">
                    {/* Replace direct bookmark button with BookmarkButton component */}
                    {entityType && entityId && (
                        <BookmarkButton
                            entityId={entityId}
                            entityType={entityType}
                            isBookmarked={isBookmarked}
                            variant="button"
                            size="md"
                            onBookmarkChange={onToggleBookmark}
                        />
                    )}

                    {/* If entityType/entityId are not provided, use the original toggle method */}
                    {(!entityType || !entityId) && (
                        <Button
                            variant="outline"
                            leftIcon={isBookmarked ? BookMarked : BookMarked}
                            onClick={onToggleBookmark}
                            className={
                                isBookmarked
                                    ? "text-blue-600 border-blue-300 bg-blue-50"
                                    : ""
                            }
                        >
                            {isBookmarked ? "Bookmarked" : "Bookmark"}
                        </Button>
                    )}

                    {/* Other action buttons */}
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant || "outline"}
                            leftIcon={action.icon}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EntityHeader;
