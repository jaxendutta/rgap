// src/components/entity/EntitiesPage.tsx
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EntityList from "@/components/entity/EntityList";
import { EntityCard } from "@/components/entity/EntityCard";
import { IconType } from "react-icons";
import { EntityType, InstituteWithStats, RecipientWithStats, SortOption } from "@/types/database";
import { TrendVisualizer } from "@/components/visualizations/TrendVisualizer";
import { getAggregatedTrends } from "@/app/actions/analytics";

// The list-page chart defaults to grouping by funding agency; preload that view
// server-side so it paints with data instead of a client-side fetch waterfall.
const DEFAULT_TREND_GROUPING = "org";

interface EntitiesPageProps {
    title: string;
    subtitle: string;
    icon: IconType;
    entities: (InstituteWithStats | RecipientWithStats)[];
    totalItems: number;
    entityType: EntityType;
    emptyMessage?: string;
    showVisualization?: boolean;
    sortOptions?: SortOption[];
    page: number;
}

const EntitiesPage = async ({
    title,
    subtitle,
    icon,
    entities,
    totalItems,
    entityType,
    emptyMessage = "No items found",
    showVisualization = false,
    sortOptions,
    page,
}: EntitiesPageProps) => {

    const ids = entities.map(entity =>
        'recipient_id' in entity
            ? entity.recipient_id
            : (entity as InstituteWithStats).institute_id
    );

    // Only recipients/institutes get the funding-trend chart.
    const vizEntityType =
        (entityType === 'recipient' || entityType === 'institute') ? entityType : null;
    const showViz = showVisualization && entities.length > 0 && vizEntityType !== null;

    // Preload the default (global) grouping so the chart renders immediately.
    // Served from the global_trend_stats materialized view, so this is cheap.
    const trendData = showViz && vizEntityType
        ? await getAggregatedTrends(vizEntityType, [], DEFAULT_TREND_GROUPING)
        : undefined;

    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
            />

            {showViz && vizEntityType && (
                <TrendVisualizer
                    entityType={vizEntityType}
                    title={`${title} Funding Trends`}
                    preLoadedData={trendData}
                    initialGrouping={DEFAULT_TREND_GROUPING}
                />
            )}

            <EntityList
                entityType={entityType}
                entities={entities}
                totalCount={totalItems}
                emptyMessage={emptyMessage}
                showVisualization={false}
                sortOptions={sortOptions}
                page={page}
            >
                {entities.map((entity) => {
                    const id = 'recipient_id' in entity
                        ? entity.recipient_id
                        : (entity as InstituteWithStats).institute_id;

                    return (
                        <EntityCard
                            key={id}
                            entity={entity}
                            entityType={entityType}
                        />
                    );
                })}
            </EntityList>
        </PageContainer>
    );
};

export default EntitiesPage;
