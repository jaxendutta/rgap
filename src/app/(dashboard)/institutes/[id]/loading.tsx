// Instant loading UI for an institute detail page. The page is an async server
// component that fetches institute + recipients/grants before rendering, so
// without this boundary a click freezes on the old page. This shows the detail
// shape immediately while that fetch runs.
import { EntityDetailSkeleton } from "@/components/ui/Skeleton";

export default function InstituteDetailLoading() {
    return <EntityDetailSkeleton />;
}
