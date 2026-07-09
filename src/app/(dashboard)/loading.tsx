// Route-level loading UI for the (dashboard) group. Shown during navigation
// and server data fetches. A page-shaped skeleton (header + list grid) settles
// in place of the content, avoiding a jarring full-screen spinner.
import PageContainer from "@/components/layout/PageContainer";
import { Skeleton, EntityListSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
    return (
        <PageContainer>
            {/* Page header */}
            <div className="mb-4 md:mb-6 space-y-2">
                <Skeleton className="h-8 w-56 rounded-lg" />
                <Skeleton className="h-4 w-72 rounded" />
            </div>

            <EntityListSkeleton />
        </PageContainer>
    );
}
