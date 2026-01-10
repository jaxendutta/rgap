// src/components/features/search/SearchInterface.tsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Search as SearchIcon,
    UserSearch,
    University,
    FileSearch2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/features/search/SearchField";

// ============================================================================
// TYPES
// ============================================================================

interface SearchInterfaceProps {
    initialValues?: {
        recipient?: string;
        institute?: string;
        grant?: string;
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SearchInterface({ initialValues = {} }: SearchInterfaceProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Search field states - Initialize with URL params if provided
    const [recipient, setRecipient] = useState(initialValues.recipient || '');
    const [institute, setInstitute] = useState(initialValues.institute || '');
    const [grant, setGrant] = useState(initialValues.grant || '');

    // Handle search
    const handleSearch = () => {
        const params = new URLSearchParams();

        if (recipient.trim()) params.set('recipient', recipient.trim());
        if (institute.trim()) params.set('institute', institute.trim());
        if (grant.trim()) params.set('grant', grant.trim());

        // Use startTransition for smooth navigation
        startTransition(() => {
            router.push(`/search?${params.toString()}`);
        });
    };

    // Handle clear
    const handleClear = () => {
        setRecipient('');
        setInstitute('');
        setGrant('');

        startTransition(() => {
            router.push('/search');
        });
    };

    // Check if any field has content
    const hasContent = recipient || institute || grant;

    return (
        <div className="flex flex-col gap-3">
            {/* Search Fields */}
            <SearchField
                icon={UserSearch}
                placeholder="Search by recipient name..."
                value={recipient}
                onChange={setRecipient}
                onEnter={handleSearch}
            />

            <SearchField
                icon={University}
                placeholder="Search by institute name..."
                value={institute}
                onChange={setInstitute}
                onEnter={handleSearch}
            />

            <SearchField
                icon={FileSearch2}
                placeholder="Search by grant title..."
                value={grant}
                onChange={setGrant}
                onEnter={handleSearch}
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
                <Button
                    variant="primary"
                    leftIcon={SearchIcon}
                    onClick={handleSearch}
                    disabled={isPending}
                    className="flex-1"
                >
                    {isPending ? 'Searching...' : 'Search Grants'}
                </Button>

                {hasContent && (
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        disabled={isPending}
                    >
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
