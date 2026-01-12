// src/app/(dashboard)/institutes/[id]/client.tsx
'use client';

import {
    University,
    Users,
    BookMarked,
    BarChart3,
    Calendar,
    CircleDollarSign,
    ExternalLink,
    Activity,
    TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TabItem } from '@/components/ui/Tabs';
import { EntityCard } from '@/components/entity/EntityCard';
import EntityProfilePage, { EntityHeader, StatDisplay, ActionButton, StatItem } from '@/components/entity/EntityProfilePage';
import { formatCurrency, formatCSV } from '@/lib/format';
import { InstituteWithStats, RecipientWithStats, GrantWithDetails } from '@/types/database';
import { Card } from '@/components/ui/Card';
import GrantCard from '@/components/grants/GrantCard';
import EntityAnalytics from '@/components/entity/EntityAnalytics';

interface InstituteDetailClientProps {
    institute: InstituteWithStats;
    allRecipients: RecipientWithStats[];
    allGrants: GrantWithDetails[];
    userId?: number;
}

export function InstituteDetailClient({
    institute,
    allRecipients,
    allGrants,
    userId
}: InstituteDetailClientProps) {
    const router = useRouter();

    const location = formatCSV([
        institute.city,
        institute.province,
        institute.country
    ].filter(Boolean) as string[]);

    // Define tabs - use recipient_count (consistent!)
    const tabs: TabItem[] = [
        {
            id: 'recipients',
            label: 'Recipients',
            icon: Users,
            count: institute.recipient_count
        },
        {
            id: 'grants',
            label: 'Grants',
            icon: BookMarked,
            count: institute.grant_count
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3
        }
    ];

    // Define actions
    const actions: ActionButton[] = [
        {
            icon: ExternalLink,
            label: 'Search',
            onClick: () => window.open(
                `https://www.google.com/search?q=${encodeURIComponent(institute.name)}`,
                '_blank'
            ),
            variant: 'outline',
        }
    ];

    // Render header
    const renderHeader = () => (
        <EntityHeader
            title={institute.name}
            icon={University}
            entityType="institute"
            location={location}
        />
    );

    // Render stats
    const renderStats = () => {
        // Calculate additional stats
        const currentYear = new Date().getFullYear();
        const recentYears = 3;
        
        const activeRecipientIds = new Set(
            allGrants
                .filter(g => {
                    const grantYear = new Date(g.agreement_start_date).getFullYear();
                    return grantYear >= currentYear - recentYears;
                })
                .map(g => g.recipient_id)
        );
        
        const activeCount = activeRecipientIds.size;
        const activePercentage = allRecipients.length > 0 
            ? ((activeCount / allRecipients.length) * 100).toFixed(0) 
            : '0';

        const fundingPerRecipient = allRecipients.length > 0 
            ? (institute.total_funding || 0) / allRecipients.length 
            : 0;

        const fundingPerGrant = allGrants.length > 0 
            ? (institute.total_funding || 0) / allGrants.length 
            : 0;

        const stats: StatItem[] = [
            {
                icon: Users,
                label: 'Recipients',
                value: institute.recipient_count || 0
            },
            {
                icon: BookMarked,
                label: 'Grants',
                value: institute.grant_count || 0
            },
            {
                icon: CircleDollarSign,
                label: 'Total Funding',
                value: formatCurrency(institute.total_funding || 0)
            },
            {
                icon: Calendar,
                label: 'Active Since',
                value: institute.first_grant_date
                    ? new Date(institute.first_grant_date).getFullYear().toString()
                    : 'N/A'
            },
            {
                icon: Activity,
                label: 'Active Recipients',
                value: `${activeCount.toLocaleString()} / ${activePercentage}%`
            },
            {
                icon: TrendingUp,
                label: 'Funding / Recipient',
                value: formatCurrency(fundingPerRecipient)
            },
            {
                icon: BarChart3,
                label: 'Funding / Grant',
                value: formatCurrency(fundingPerGrant)
            }
        ];

        return <StatDisplay items={stats} columns={4} />;
    };

    // Render tab content
    const renderTabContent = (tabId: string) => {
        switch (tabId) {
            case 'recipients':
                // Show top 10 recipients in tab
                const topRecipients = allRecipients.slice(0, 10);

                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Top Recipients ({topRecipients.length})
                            </h2>
                            {allRecipients.length > 10 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/institutes/${institute.institute_id}/recipients`)}
                                >
                                    View All {allRecipients.length.toLocaleString()} Recipients
                                </Button>
                            )}
                        </div>

                        {topRecipients.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center text-gray-500">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium">No recipients found</p>
                                    <p className="text-sm mt-1">This institute has no recorded recipients yet.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {topRecipients.map((recipient) => (
                                    <EntityCard
                                        key={recipient.recipient_id}
                                        entity={recipient}
                                        entityType="recipient"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'grants':
                // Show top 20 grants in tab
                const topGrants = allGrants.slice(0, 20);

                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Grants ({topGrants.length})
                            </h2>
                            {allGrants.length > 20 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/institutes/${institute.institute_id}/grants`)}
                                >
                                    View All {allGrants.length.toLocaleString()} Grants
                                </Button>
                            )}
                        </div>

                        {topGrants.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center text-gray-500">
                                    <BookMarked className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium">No grants found</p>
                                    <p className="text-sm mt-1">This institute has no recorded grants yet.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {topGrants.map((grant) => (
                                    <GrantCard key={grant.grant_id} {...grant} />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'analytics':
                // Pass ALL data to EntityAnalytics
                return (
                    <EntityAnalytics
                        entity={institute}
                        entityType="institute"
                        grants={allGrants}
                        recipients={allRecipients}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <EntityProfilePage
            renderHeader={renderHeader}
            renderStats={renderStats}
            tabs={tabs}
            defaultTab="recipients"
            renderTabContent={renderTabContent}
            actions={actions}
            entityType="institute"
            entityId={institute.institute_id}
            isBookmarked={institute.is_bookmarked}
        />
    );
}
