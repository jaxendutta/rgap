// src/components/entity/EntityProfilePage.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card } from "@/components/ui/Card";
import Tabs, { TabItem } from "@/components/ui/Tabs";
import PageContainer from "@/components/layout/PageContainer";
import { LuMapPin, LuChevronLeft, LuChevronDown } from 'react-icons/lu';
import { useRouter } from 'next/navigation';
import Tag from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import { IconType } from 'react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ============================================================================
// EntityHeader Component
// ============================================================================

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

    // Optional props
    location?: string;
    metadata?: MetadataItem[];
    subtitle?: string;
    badge?: {
        text: string;
        icon?: IconType;
    };
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
    title,
    icon: Icon,
    entityType,
    location,
    metadata = [],
    subtitle,
    badge,
}) => {
    const router = useRouter();
    const locationTag = useMemo(() => {
        if (!location) return null;
        return {
            icon: LuMapPin,
            text: location,
            variant: 'default' as const,
        };
    }, [location]);

    // Color scheme based on entity type
    const colorScheme = entityType === 'institute'
        ? { bg: 'bg-blue-100', text: 'text-blue-600' }
        : { bg: 'bg-purple-100', text: 'text-purple-600' };

    return (
        <div className="p-4 md:p-6">
            {/* Main Header Content */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Icon and Title */}
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 ${colorScheme.bg} rounded-lg`}>
                            <Icon className={`h-4 md:h-6 w-4 md:w-6 ${colorScheme.text}`} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-2xl font-bold text-gray-900">
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
                        {locationTag && (<Tag icon={locationTag.icon} text={locationTag.text} variant={locationTag.variant} className="text-xs md:text-sm" />)}

                        {/* Badge (e.g., recipient type) */}
                        {badge && (<Tag icon={badge.icon} text={badge.text} className="text-xs md:text-sm" />)}

                        {/* Metadata Items */}
                        {metadata.length > 0 &&
                            metadata.map((item, index) =>
                                item.href
                                    ? (<Tag
                                        key={index}
                                        onClick={() => router.push(item.href!)}
                                        text={item.text}
                                        icon={item.icon}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs md:text-sm"
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

// ============================================================================
// StatDisplay Component
// ============================================================================

export interface StatItem {
    icon: IconType;
    label: string;
    value: string | number;
}

const StatItemContent: React.FC<{ item: StatItem }> = ({ item }) => {
    const Icon = item.icon;
    return (
        <div
            className="flex flex-col items-center p-3 bg-blue-100/60 rounded-lg"
        >
            <span className="flex text-gray-700 rounded-lg text-xs items-center justify-center gap-1">
                <Icon className="w-2.5 md:w-3 h-2.5 md:h-3" />
                {item.label}
            </span>
            <div className="text-base md:text-lg font-semibold text-gray-900">
                {typeof item.value === 'number'
                    ? item.value.toLocaleString()
                    : item.value
                }
            </div>
        </div>
    );
};

export interface StatDisplayProps {
    items: StatItem[];
    columns?: 2 | 3 | 4;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({
    items,
    columns = 4,
}) => {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-2 md:gap-4 p-3 md:p-6 pt-0`}>
            {items.map((item, index) => (
                <StatItemContent key={index} item={item} />
            ))}
        </div>
    );
};

// ============================================================================
// EntityProfilePage Component
// ============================================================================

export interface EntityProfilePageProps {
    // Header and stats content
    renderHeader: () => React.ReactNode;
    renderStats: () => React.ReactNode;

    // Tabs and content
    tabs: TabItem[];
    defaultTab?: string;

    // Tab content renderers
    renderTabContent: (tabId: string) => React.ReactNode;

    // Actions Bar Props
    actions?: ActionButton[];
    isBookmarked?: boolean;
    entityType: 'institute' | 'recipient';
    entityId: number;
}

/**
 * EntityProfilePage - Reusable layout for entity detail pages
 * Works for both institutes and recipients
 * Follows render props pattern for flexibility
 */
const EntityProfilePage: React.FC<EntityProfilePageProps> = ({
    renderHeader,
    renderStats,
    tabs,
    defaultTab,
    renderTabContent,
    actions = [],
    isBookmarked = false,
    entityType,
    entityId,
}) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');
    const [statsExpanded, setStatsExpanded] = useState(false);

    return (
        <PageContainer>
            {/* Top Actions Bar */}
            <div className="mb-4 flex justify-between items-center">
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={LuChevronLeft}
                    onClick={() => router.back()}
                    className="text-xs md:text-base"
                >
                    Back
                </Button>

                <div className="flex flex-wrap gap-2">
                    {actions.length > 0 && actions.map((action, index) => {
                        const ActionIcon = action.icon;
                        return (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                leftIcon={ActionIcon}
                                onClick={action.onClick}
                                className="text-xs md:text-base"
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
            </div>

            {/* Header with profile and quick stats */}
            <Card className="mb-6 overflow-hidden">
                {/* Entity header (name, location, actions) */}
                {renderHeader()}

                {/* Stats section */}
                {(() => {
                    const statsNode = renderStats();
                    if (!React.isValidElement(statsNode) || statsNode.type !== StatDisplay) {
                        return statsNode;
                    }

                    const allItems = (statsNode.props as StatDisplayProps).items as StatItem[];
                    const columns = (statsNode.props as StatDisplayProps).columns || 4;
                    const initialCount = 4;
                    const hasMore = allItems.length > initialCount;

                    const visibleItems = allItems.slice(0, initialCount);
                    const hiddenItems = hasMore ? allItems.slice(initialCount) : [];

                    const gridCols = {
                        2: 'grid-cols-2',
                        3: 'grid-cols-2 md:grid-cols-3',
                        4: 'grid-cols-2 md:grid-cols-4',
                    };
                    const gridClassName = `grid ${gridCols[columns]} gap-2 md:gap-4 px-3 md:px-6 pb-2 md:pb-4`;

                    return (
                        <div>
                            <div className={cn(gridClassName)}>
                                {visibleItems.map((item, index) => (
                                    <StatItemContent key={index} item={item} />
                                ))}
                            </div>

                            <AnimatePresence>
                                {statsExpanded && hasMore && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className={cn(gridClassName, 'pt-2 md:pt-4')}>
                                            {hiddenItems.map((item, index) => (
                                                <StatItemContent key={index} item={item} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {hasMore && (
                                <div className="flex justify-center items-center">
                                    <Button variant="ghost" size="sm" onClick={() => setStatsExpanded(!statsExpanded)} className="rounded-full w-8 h-8 p-0 bg-white/50 hover:bg-gray-200 z-10 -mt-2 md:-mt-4">
                                        <LuChevronDown className={cn("h-5 w-5 text-gray-500 transition-transform duration-300", statsExpanded && "rotate-180")} />
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Card>

            {/* Tabs and Content */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={setActiveTab}
                variant="pills"
                size="sm"
                fullWidth
            />

            <div className="animate-in fade-in duration-300 mt-4">
                {renderTabContent(activeTab)}
            </div>
        </PageContainer >
    );
};

export default EntityProfilePage;
