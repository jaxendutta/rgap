// src/components/entity/EntitiesPage.tsx
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EntityList from "@/components/entity/EntityList";
import { EntityCard } from "@/components/entity/EntityCard";
import { Pagination } from "@/components/ui/Pagination";
import { IconType } from "react-icons";
import { EntityType, GrantWithDetails, InstituteWithStats, RecipientWithStats } from "@/types/database";

interface EntitiesPageProps {
    title: string;
    subtitle: string;
    icon: IconType;
    entities: (InstituteWithStats | RecipientWithStats)[];
    totalItems: number;
    totalPages: number;
    entityType: EntityType;
    emptyMessage?: string;
    showVisualization?: boolean;
    visualizationData?: GrantWithDetails[];
}

const EntitiesPage = ({
    title,
    subtitle,
    icon,
    entities,
    totalItems,
    totalPages,
    entityType,
    emptyMessage = "No items found",
    showVisualization = false,
    visualizationData = [],
}: EntitiesPageProps) => {
    return (
        <PageContainer className="space-y-6">
            <PageHeader
                title={title}
                subtitle={subtitle}
                icon={icon}
            />

            <EntityList
                entityType={entityType}
                entities={entities}
                totalCount={totalItems}
                emptyMessage={emptyMessage}
                showVisualization={showVisualization}
                visualizationData={visualizationData}
            // No sortOptions passed; EntityList uses defaults
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

            <Pagination totalPages={totalPages} />
        </PageContainer>
    );
};

export default EntitiesPage;
