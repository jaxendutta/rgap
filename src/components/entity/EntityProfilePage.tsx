// src/components/entity/EntityProfilePage.tsx
'use client';

import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import Tabs, { TabItem } from "@/components/ui/Tabs";
import PageContainer from "@/components/layout/PageContainer";
import { LuChevronDown, LuUniversity, LuGraduationCap } from 'react-icons/lu';
import { BsChevronLeft } from "react-icons/bs";
import { useRouter } from 'next/navigation';
import Tag from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import BookmarkButton from '@/components/bookmarks/BookmarkButton';
import { IconType } from 'react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import LocationMapDropdown from '@/components/entity/LocationMapDropdown';

// ============================================================================
// EntityHeader Component
// ============================================================================

export interface MetadataItem {
    icon: IconType;
    text: string;
    href?: string;
}

export interface ActionButton {
    icon?: IconType;
    rightIcon?: IconType;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export interface EntityHeaderProps {
    title: string;
    icon?: IconType;
    entityType: 'institute' | 'recipient';
    location?: string;
    metadata?: MetadataItem[];
    subtitle?: string;
    badge?: {
        text: string;
        icon?: IconType;
    };
    mapSearchQuery?: string;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
    title,
    entityType,
    location,
    metadata = [],
    subtitle,
    badge,
    mapSearchQuery,
}) => {
    const router = useRouter();

    return (
        <div>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="mb-2">
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-gray-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-sm text-gray-600 mt-1">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 w-full">
                        <Tag
                            text={entityType === 'institute' ? 'Institute' : 'Recipient'}
                            icon={entityType === 'institute' ? LuUniversity : LuGraduationCap}
                            variant={entityType === 'institute' ? 'primary' : 'secondary'}
                            className="text-xs md:text-sm"
                        />
                        {badge && (<Tag icon={badge.icon} text={badge.text} className="text-xs md:text-sm" />)}
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
                        {location && <LocationMapDropdown instituteName={mapSearchQuery || title} location={location} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export interface StatItem {
    icon: IconType;
    label: string;
    values: (string | number)[];
}

const StatItemContent: React.FC<{ item: StatItem }> = ({ item }) => {
    const Icon = item.icon;
    return (
        <div className="relative overflow-hidden flex flex-col items-center p-3 md:p-4 bg-blue-100/60 rounded-2xl gap-1 justify-center min-h-[72px]">
            {/* Static background watermark icon */}
            {Icon && (
                <div className="absolute -right-3 -bottom-3 text-blue-900/10 pointer-events-none z-0">
                    <Icon className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0" />
                </div>
            )}

            <span className="relative z-10 text-gray-600 rounded-lg text-[10px] md:text-xs text-center font-medium">
                {item.label}
            </span>
            <div className="relative z-10 text-sm md:text-lg font-semibold text-gray-900 text-center flex flex-wrap justify-center gap-1.5 md:gap-2">
                {item.values.length === 0
                    ? 'N/A'
                    : item.values.length === 1
                        ? typeof item.values[0] === 'number' ? item.values[0].toLocaleString() : item.values[0]
                        : item.values.map((val, idx) => (
                            <div key={idx} className="bg-white/60 rounded-3xl px-2 py-0.5 text-xs md:text-sm font-medium">
                                {typeof val === 'number' ? val.toLocaleString() : val}</div>
                        ))}
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
        <div className={`grid ${gridCols[columns]} gap-2 md:gap-4`}>
            {items.map((item, index) => (
                <StatItemContent key={index} item={item} />
            ))}
        </div>
    );
};

export interface EntityProfilePageProps {
    renderHeader: () => React.ReactNode;
    renderStats: () => React.ReactNode;
    tabs: TabItem[];
    defaultTab?: string;
    activeTab?: string; // Controlled state
    onTabChange?: (tabId: string) => void; // Controlled handler
    renderTabContent: (tabId: string) => React.ReactNode;
    actions?: ActionButton[];
    isBookmarked?: boolean;
    entityType: 'institute' | 'recipient';
    entityId: number;
}

const EntityProfilePage: React.FC<EntityProfilePageProps> = ({
    renderHeader,
    renderStats,
    tabs,
    defaultTab,
    activeTab: propsActiveTab,
    onTabChange,
    renderTabContent,
    actions = [],
    isBookmarked = false,
    entityType,
    entityId,
}) => {
    const router = useRouter();
    const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id || '');
    const [statsExpanded, setStatsExpanded] = useState(false);

    // Use controlled tab if provided, otherwise internal
    const activeTab = propsActiveTab ?? internalTab;

    const handleTabChange = (id: string) => {
        if (onTabChange) {
            onTabChange(id);
        } else {
            setInternalTab(id);
        }
    };

    return (
        <PageContainer>
            <div className="mb-4 flex justify-between items-center">
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={BsChevronLeft}
                    onClick={() => router.back()}
                    className="text-xs md:text-sm bg-white"
                >
                    Back
                </Button>

                <div className="flex flex-wrap gap-2">
                    {actions.map((action, index) => {
                        const ActionIcon = action.icon;
                        const RightIcon = action.rightIcon;
                        return (
                            <Button
                                key={index}
                                variant={action.variant || 'outline'}
                                size="sm"
                                leftIcon={ActionIcon}
                                rightIcon={RightIcon}
                                onClick={action.onClick}
                                className="text-xs md:text-sm bg-white"
                            >
                                {action.label}
                            </Button>
                        );
                    })}
                    <BookmarkButton
                        entityType={entityType}
                        entityId={entityId}
                        isBookmarked={isBookmarked}
                    />
                </div>
            </div>

            {(() => {
                const statsNode = renderStats();
                let hasMore = false;
                if (React.isValidElement(statsNode) && statsNode.type === StatDisplay) {
                    const allItems = (statsNode.props as StatDisplayProps).items as StatItem[];
                    hasMore = allItems.length > 4;
                }

                return (
                    <Card className={cn(
                        "mb-6 p-4 md:p-6 flex flex-col gap-4 md:gap-6",
                        hasMore && "pb-2 md:pb-3"
                    )}>
                        {renderHeader()}

                        {(() => {
                            if (!React.isValidElement(statsNode) || statsNode.type !== StatDisplay) {
                                return statsNode;
                            }
                            const allItems = (statsNode.props as StatDisplayProps).items as StatItem[];
                            const columns = (statsNode.props as StatDisplayProps).columns || 4;
                            const initialCount = 4;
                            const visibleItems = allItems.slice(0, initialCount);
                            const hiddenItems = allItems.slice(initialCount);

                            const gridCols = {
                                2: 'grid-cols-2',
                                3: 'grid-cols-2 md:grid-cols-3',
                                4: 'grid-cols-2 md:grid-cols-4',
                            };
                            const gridClassName = `grid ${gridCols[columns]} gap-2 md:gap-4`;

                            return (
                                <div className="flex flex-col gap-2 md:gap-4">
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
                                                <div className={cn(gridClassName)}>
                                                    {hiddenItems.map((item, index) => (
                                                        <StatItemContent key={index} item={item} />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {hasMore && (
                                        <div className="flex justify-center items-center -mb-2 md:-mb-3">
                                            <Button variant="ghost" size="sm" onClick={() => setStatsExpanded(!statsExpanded)} className="rounded-full w-8 h-8 p-0 bg-white/50 hover:bg-gray-200 z-10">
                                                <LuChevronDown className={cn("h-5 w-5 text-gray-500 transition-transform duration-300", statsExpanded && "rotate-180")} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </Card>
                );
            })()}

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={handleTabChange}
                variant="pills"
                size="sm"
                fullWidth
                className="bg-white"
            />

            <div className="animate-in fade-in duration-300 mt-4">
                {renderTabContent(activeTab)}
            </div>
        </PageContainer >
    );
};

export default EntityProfilePage;
