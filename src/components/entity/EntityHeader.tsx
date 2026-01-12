// src/components/entity/EntityHeader.tsx
'use client';

import React, { useMemo } from 'react';
import { MapPin, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Tag from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import { IconType } from 'react-icons';

export interface MetadataItem {
    icon: IconType;
    text: string;
    href?: string;
}

export interface ActionButton {
    icon: IconType;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface EntityHeaderProps {
    // Required props
    title: string;
    icon: IconType;
    entityType: 'institute' | 'recipient';
    entityId: number;

    // Optional props
    location?: string;
    metadata?: MetadataItem[];
    actions?: ActionButton[];
    isBookmarked?: boolean;
    userId?: number;
    subtitle?: string;
    badge?: {
        text: string;
        icon?: IconType;
    };
}

const EntityHeader: React.FC<EntityHeaderProps> = ({
    title,
    icon: Icon,
    entityType,
    entityId,
    location,
    metadata = [],
    actions = [],
    isBookmarked = false,
    userId,
    subtitle,
    badge,
}) => {
    const router = useRouter();

    const locationTag = useMemo(() => {
        if (!location) return null;
        return {
            icon: MapPin,
            text: location,
            variant: 'default' as const,
        };
    }, [location]);

    // Color scheme based on entity type
    const colorScheme = entityType === 'institute'
        ? { bg: 'bg-blue-100', text: 'text-blue-600' }
        : { bg: 'bg-purple-100', text: 'text-purple-600' };

    return (
        <div className="p-6">
            {/* Back Button */}
            <div className="mb-4 justify-between flex">
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={ChevronLeft}
                    onClick={() => router.back()}
                >
                    Back
                </Button>

                {/* Action Buttons */}
                {actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {actions.map((action, index) => {
                            const ActionIcon = action.icon;
                            return (
                                <Button
                                    key={index}
                                    variant={action.variant || 'outline'}
                                    size="sm"
                                    leftIcon={ActionIcon}
                                    onClick={action.onClick}
                                >
                                    {action.label}
                                </Button>
                            );
                        })}

                        {/* Bookmark Button */}
                        <BookmarkButton
                            entityType={entityType}
                            entityId={entityId}
                            isBookmarked={isBookmarked}
                        />
                    </div>
                )}
            </div>

            {/* Main Header Content */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 ${colorScheme.bg} rounded-lg`}>
                            <Icon className={`h-6 w-6 ${colorScheme.text}`} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        {/* Location Tag */}
                        {locationTag && (<Tag icon={locationTag.icon} text={locationTag.text} variant={locationTag.variant} />)}

                        {/* Badge (e.g., recipient type) */}
                        {badge && (<Tag icon={badge.icon} text={badge.text} />)}

                        {/* Metadata Items */}
                        {metadata.length > 0 &&
                            metadata.map((item, index) =>
                                item.href
                                    ? (<Tag
                                        key={index}
                                        onClick={() => router.push(item.href!)}
                                        text={item.text}
                                        icon={item.icon}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                                    />)
                                    : (<Tag key={index} text={item.text} icon={item.icon} />)
                            )
                        }

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntityHeader;
