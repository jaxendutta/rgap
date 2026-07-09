// src/components/ui/Skeleton.tsx
// Skeleton loading primitives. These mirror the shape of the content they stand
// in for (cards, list headers, grids) so page loads settle without a layout
// jump — a calmer alternative to a full-screen spinner.
import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import PageContainer from "@/components/layout/PageContainer";

// ----------------------------------------------------------------------------
// Base primitive: a single pulsing block. Compose these into richer shapes.
// ----------------------------------------------------------------------------
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton = ({ className, ...props }: SkeletonProps) => (
    <div
        aria-hidden
        className={cn("animate-pulse rounded-md bg-gray-200/80", className)}
        {...props}
    />
);

// ----------------------------------------------------------------------------
// EntityCardSkeleton — mirrors EntityCard: title, metadata tags, 3 stat tiles.
// ----------------------------------------------------------------------------
export const EntityCardSkeleton = ({ className }: { className?: string }) => (
    <Card className={cn("py-3 px-4", className)}>
        {/* Header: name + bookmark */}
        <div className="flex justify-between items-center gap-2">
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
        </div>

        {/* Metadata tags */}
        <div className="flex gap-1.5 mt-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
        </div>

        {/* Stat tiles */}
        <div className="flex justify-evenly gap-2 mt-2 md:mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grow py-2 px-2 bg-slate-100 rounded-lg">
                    <Skeleton className="h-2.5 w-12 mx-auto rounded" />
                    <Skeleton className="h-3.5 w-14 mx-auto mt-1.5 rounded" />
                </div>
            ))}
        </div>
    </Card>
);

// ----------------------------------------------------------------------------
// EntityListSkeleton — mirrors EntityList: header row, search bar, card grid.
// ----------------------------------------------------------------------------
export const EntityListSkeleton = ({
    count = 6,
    layout = "grid",
    className,
}: {
    count?: number;
    layout?: "grid" | "list";
    className?: string;
}) => (
    <div className={cn("space-y-6", className)}>
        {/* Header row: count + sort/layout controls */}
        <div className="flex flex-col w-full gap-2">
            <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-40 rounded" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
            {/* Search bar */}
            <Skeleton className="h-11 w-full rounded-3xl" />
        </div>

        {/* Card grid / list */}
        <div
            className={cn(
                layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start"
                    : "space-y-4"
            )}
        >
            {Array.from({ length: count }).map((_, i) => (
                <EntityCardSkeleton key={i} />
            ))}
        </div>
    </div>
);

// ----------------------------------------------------------------------------
// EntityDetailSkeleton — mirrors EntityProfilePage: back/action row, header +
// stats card, tab bar, and content (chart block + card grid). Used by the
// institute/recipient detail route loading.tsx so a click shows the shape
// instantly instead of freezing on the server fetch.
// ----------------------------------------------------------------------------
export const EntityDetailSkeleton = () => (
    <PageContainer>
        {/* Back + actions row */}
        <div className="mb-4 flex justify-between items-center">
            <Skeleton className="h-8 w-20 rounded-full" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>

        {/* Header + stats card */}
        <Card className="mb-6 overflow-hidden">
            <div className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-56 max-w-[60vw] rounded" />
                        <Skeleton className="h-4 w-32 rounded" />
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <Skeleton className="h-6 w-40 rounded-full" />
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-3 md:px-6 pb-3 md:pb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center p-3 bg-blue-100/40 rounded-2xl gap-2">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-5 w-20 rounded" />
                    </div>
                ))}
            </div>
        </Card>

        {/* Tab bar */}
        <Skeleton className="h-10 w-full rounded-full mb-4" />

        {/* Content: chart block + card grid (analytics default) */}
        <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                {Array.from({ length: 6 }).map((_, i) => (
                    <EntityCardSkeleton key={i} />
                ))}
            </div>
        </div>
    </PageContainer>
);

export default Skeleton;
