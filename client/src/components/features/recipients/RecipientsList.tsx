// src/components/features/institutes/RecipientsList.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import {
    GraduationCap,
    BookMarked,
    DollarSign,
    MoreHorizontal,
    Users,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Card } from "@/components/common/ui/Card";
import { SortButton } from "@/components/common/ui/SortButton";
import { Button } from "@/components/common/ui/Button";
import LoadingState from "@/components/common/ui/LoadingState";
import EmptyState from "@/components/common/ui/EmptyState";
import ErrorState from "@/components/common/ui/ErrorState";
import { useInfiniteInstituteRecipients } from "@/hooks/api/useInfiniteInstituteData";

interface RecipientsListProps {
    instituteId: string | number;
    initialPageSize?: number;
}

export const RecipientsList = ({
    instituteId,
    initialPageSize = 10,
}: RecipientsListProps) => {
    // State for sorting
    const [sortConfig, setSortConfig] = useState<{
        field: "total_funding" | "grants_count";
        direction: "asc" | "desc";
    }>({
        field: "total_funding",
        direction: "desc",
    });

    // Set up infinite scrolling with intersection observer
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: "0px 0px 500px 0px", // Trigger 500px before reaching the end
    });

    // Fetch data with infinite query
    const {
        data,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
        isError,
        error,
        refetch,
    } = useInfiniteInstituteRecipients(
        instituteId,
        initialPageSize,
        sortConfig.field,
        sortConfig.direction
    );

    // Load more data when user scrolls to the bottom
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Handle sort change
    const handleSortChange = (field: "total_funding" | "grants_count") => {
        setSortConfig((prev) => ({
            field,
            direction:
                prev.field === field && prev.direction === "desc"
                    ? "asc"
                    : "desc",
        }));
    };

    // Flatten the pages of data into a single array
    const allRecipients = data ? data.pages.flatMap((page) => page.data) : [];

    // Total count from first page if available
    const totalCount = data?.pages[0]?.metadata.totalCount || 0;

    // Handle error state
    if (isError && error) {
        return (
            <ErrorState
                title="Error Loading Recipients"
                message={
                    error instanceof Error
                        ? error.message
                        : "Failed to load recipients"
                }
                onRetry={() => refetch()}
                size="md"
            />
        );
    }

    // Handle initial loading state
    if (isLoading && !data) {
        return <LoadingState title="Loading Recipients..." size="md" />;
    }

    // Handle empty state
    if (!isLoading && allRecipients.length === 0) {
        return (
            <EmptyState
                title="No Recipients Found"
                message="This institute has no associated recipients in our database."
                size="md"
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with sort controls */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="text-lg font-medium">Recipients</div>
                    {totalCount > 0 && (
                        <span className="text-sm text-gray-500 lg:ml-2">
                            ({allRecipients.length.toLocaleString()} out of {totalCount.toLocaleString()} results)
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <SortButton
                        label="Funding"
                        icon={DollarSign}
                        field="total_funding"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() => handleSortChange("total_funding")}
                    />
                    <SortButton
                        label="Grants"
                        icon={Users}
                        field="grants_count"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() => handleSortChange("grants_count")}
                    />
                </div>
            </div>

            {/* Recipients list */}
            <div className="space-y-4">
                {allRecipients.map((recipient) => (
                    <Card
                        key={`recipient-${recipient.recipient_id}`}
                        className="p-4 hover:border-gray-300 transition-all"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                            <div className="space-y-1">
                                <Link
                                    to={`/recipients/${recipient.recipient_id}`}
                                    className="text-lg font-medium hover:text-blue-600 transition-colors flex items-center"
                                >
                                    <GraduationCap className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    {recipient.legal_name}
                                </Link>
                                <div className="text-sm text-gray-500 flex items-center">
                                    <BookMarked className="h-4 w-4 mr-1.5 flex-shrink-0" />
                                    {recipient.grants_count} grants
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-medium text-lg flex items-center justify-end">
                                    <DollarSign className="h-4 w-4 mr-1 flex-shrink-0" />
                                    {formatCurrency(recipient.total_funding)}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Loading indicator for infinite scroll */}
            <div ref={ref} className="flex justify-center py-4 h-16">
                {isFetchingNextPage ? (
                    <LoadingState
                        title=""
                        message="Loading more recipients..."
                        size="sm"
                    />
                ) : hasNextPage ? (
                    <Button
                        variant="outline"
                        icon={MoreHorizontal}
                        onClick={() => fetchNextPage()}
                    >
                        Load More
                    </Button>
                ) : allRecipients.length > 0 ? (
                    <p className="text-sm text-gray-500">
                        All recipients loaded
                    </p>
                ) : null}
            </div>
        </div>
    );
};
