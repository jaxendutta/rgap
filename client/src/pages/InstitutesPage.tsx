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
            subtitle="Explore and discover research institutes."
            useInfiniteEntities={useInfiniteInstitutes}
            useSearchEntities={useSearchInstitutes}
            variant="grid"
        />
    );
};

export default InstitutesPage;
