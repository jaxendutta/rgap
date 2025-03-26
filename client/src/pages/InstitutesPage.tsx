// src/pages/InstitutesPage.tsx
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import {
    useInfiniteInstitutes,
    useSearchInstitutes,
} from "@/hooks/api/useInstitutes";

const InstitutesPage = () => {
    return (
        <EntitiesPage
            entityType="institute"
            title="Research Institutes"
            subtitle="Explore and discover research institutes across various regions and types."
            useInfiniteEntities={useInfiniteInstitutes}
            useSearchEntities={useSearchInstitutes}
            searchPlaceholder="Search by institute name, type, or location..."
            emptyMessage="No research institutes found. Try adjusting your filters or check back later."
            searchEmptyMessage="No institutes match your search criteria. Try different keywords."
        />
    );
};

export default InstitutesPage;
