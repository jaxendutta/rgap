// Instant loading UI for a recipient detail page. See the institute variant —
// the async server fetch would otherwise freeze the previous page on navigation.
import { EntityDetailSkeleton } from "@/components/ui/Skeleton";

export default function RecipientDetailLoading() {
    return <EntityDetailSkeleton />;
}
