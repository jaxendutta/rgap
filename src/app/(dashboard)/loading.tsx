// src/app/(dashboard)/loading.tsx
import LoadingState from "@/components/ui/LoadingState";

export default function DashboardLoading() {
    return (
        <LoadingState
            title="Loading..."
            message="Preparing your dashboard"
            fullHeight
        />
    );
}
