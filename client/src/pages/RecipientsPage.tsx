// src/pages/RecipientsPage.tsx
import { useNotification } from "@/components/features/notifications/NotificationProvider";
import EntitiesGridPage from "@/components/common/pages/EntitiesGridPage";
import {
    useInfiniteRecipients,
    useSearchRecipients
} from "@/hooks/api/useRecipients";

const RecipientsPage = () => {
    const { showNotification } = useNotification();

    // Handle bookmarking recipients
    const handleBookmark = (recipientId: number) => {
        // In a real implementation, this would call an API to save the bookmark
        showNotification(
            `Recipient bookmarked! (ID: ${recipientId})`,
            "success"
        );
    };

    return (
        <EntitiesGridPage
            entityType="recipient"
            title="Grant Recipients"
            subtitle="Explore organizations and individuals who have received research grants."
            useInfiniteEntities={useInfiniteRecipients}
            useSearchEntities={useSearchRecipients}
            onBookmark={handleBookmark}
            searchPlaceholder="Search by recipient name, institution, or location..."
            emptyMessage="No grant recipients found. Try adjusting your filters or check back later."
            searchEmptyMessage="No recipients match your search criteria. Try different keywords."
        />
    );
};

export default RecipientsPage;
