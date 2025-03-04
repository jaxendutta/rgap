// src/components/features/grants/GrantsList.tsx
import React from 'react';
import { Calendar, DollarSign, FileSearch } from 'lucide-react';
import { GrantSortConfig } from '@/types/search';
import { ResearchGrant } from '@/types/models';
import { SortButton } from '@/components/common/ui/SortButton';
import { GrantCard } from './GrantCard';

// Grants List Component
interface GrantsListProps {
    grants: ResearchGrant[];
    sortConfig: GrantSortConfig;
    toggleSort: (field: GrantSortConfig["field"]) => void;
}

const GrantsList: React.FC<GrantsListProps> = ({
    grants,
    sortConfig,
    toggleSort,
}) => {
    // Sort the processed grants based on the current sort configuration
    const sortedGrants = [...grants].sort((a, b) => {
        if (sortConfig.field === "value") {
            return sortConfig.direction === "asc"
                ? a.agreement_value - b.agreement_value
                : b.agreement_value - a.agreement_value;
        } else {
            return sortConfig.direction === "asc"
                ? new Date(a.agreement_start_date).getTime() -
                      new Date(b.agreement_start_date).getTime()
                : new Date(b.agreement_start_date).getTime() -
                      new Date(a.agreement_start_date).getTime();
        }
    });

    return (
        <div>
            {/* Filter and sort controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 lg:mb-6">
                <h2 className="text-lg font-medium">{sortedGrants.length} Grants</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <SortButton
                        label="Date"
                        icon={Calendar}
                        field="date"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() => toggleSort("date")}
                    />
                    <SortButton
                        label="Value"
                        icon={DollarSign}
                        field="value"
                        currentField={sortConfig.field}
                        direction={sortConfig.direction}
                        onClick={() => toggleSort("value")}
                    />
                </div>
            </div>

            {/* Grants grid with grant cards */}
            <div className="space-y-4">
                {sortedGrants.length > 0 ? (
                    sortedGrants.map((grant) => (
                        <GrantCard
                            key={grant.grant_id || grant.ref_number}
                            grant={grant}
                        />
                    ))
                ) : (
                    <div className="p-8 text-center">
                        <FileSearch className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                            No Grants Found
                        </h3>
                        <p className="text-gray-500">
                            This recipient doesn't have any grants in our
                            database.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrantsList;