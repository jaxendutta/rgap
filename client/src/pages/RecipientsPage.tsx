// src/pages/RecipientsPage.tsx
import EntitiesGridPage from "@/components/common/pages/EntitiesGridPage";
import {
    useInfiniteRecipients,
    useSearchRecipients,
} from "@/hooks/api/useRecipients";

const RecipientsPage = () => {
    return (
        <EntitiesGridPage
            entityType="recipient"
            title="Grant Recipients"
            subtitle="Explore organizations and individuals who have received research grants."
            useInfiniteEntities={useInfiniteRecipients}
            useSearchEntities={useSearchRecipients}
            searchPlaceholder="Search by recipient name, institution, or location..."
            emptyMessage="No grant recipients found. Try adjusting your filters or check back later."
            searchEmptyMessage="No recipients match your search criteria. Try different keywords."
        />
    );
};

export default RecipientsPage;
