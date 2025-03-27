// src/pages/RecipientsPage.tsx
import EntitiesPage from "@/components/common/pages/EntitiesPage";
import {
    useInfiniteRecipients,
    useSearchRecipients,
} from "@/hooks/api/useRecipients";

const RecipientsPage = () => {
    return (
        <EntitiesPage
            entityType="recipient"
            title="Grant Recipients"
            subtitle="Explore organizations and individuals who have received research grants."
            useInfiniteEntities={useInfiniteRecipients}
            useSearchEntities={useSearchRecipients}
            variant="grid"
        />
    );
};

export default RecipientsPage;
