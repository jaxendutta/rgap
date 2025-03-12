// src/pages/InstitutesPage.tsx
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import EntitiesGridPage from "@/components/common/pages/EntitiesGridPage";
import {
    useInfiniteInstitutes,
    useSearchInstitutes,
} from "@/hooks/api/useInstitutes";

const InstitutesPage = () => {
    const { showNotification } = useNotification();

    // Handle bookmarking institutes
    const handleBookmark = (instituteId: number) => {
        // In a real implementation, this would call an API to save the bookmark
        showNotification(
            `Institute bookmarked! (ID: ${instituteId})`,
            "success"
        );
    };

    return (
        <EntitiesGridPage
            entityType="institute"
            title="Research Institutes"
            subtitle="Explore and discover research institutes across various regions and types."
            useInfiniteEntities={useInfiniteInstitutes}
            useSearchEntities={useSearchInstitutes}
            onBookmark={handleBookmark}
            searchPlaceholder="Search by institute name, type, or location..."
            emptyMessage="No research institutes found. Try adjusting your filters or check back later."
            searchEmptyMessage="No institutes match your search criteria. Try different keywords."
        />
    );
};

export default InstitutesPage;
