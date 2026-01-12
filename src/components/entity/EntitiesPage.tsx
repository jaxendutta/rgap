// src/components/entity/EntitiesPage.tsx
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import EntityList, { SortOption } from "@/components/entity/EntityList";
import { EntityCard } from "@/components/entity/EntityCard";
import { Pagination } from "@/components/ui/Pagination";
import { LucideIcon } from "lucide-react";
import { EntityType, InstituteWithStats, RecipientWithStats } from "@/types/database";

interface EntitiesPageProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    entities: (InstituteWithStats | RecipientWithStats)[];
    totalItems: number;
    totalPages: number;
    sortOptions: SortOption[];
    entityType: EntityType;
    emptyMessage?: string;
}

const EntitiesPage = ({
    title,
    subtitle,
    icon,
    entities,
    totalItems,
    totalPages,
    sortOptions,
    entityType,
    emptyMessage = "No items found",
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
                sortOptions={sortOptions}
                emptyMessage={emptyMessage}
            >
                {entities.map((entity) => {
                    // Determine ID based on entity type for the key
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
