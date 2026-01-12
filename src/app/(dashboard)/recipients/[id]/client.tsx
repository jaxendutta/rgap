// src/app/(dashboard)/recipients/[id]/client.tsx
'use client';

import {
    GraduationCap,
    BookMarked,
    BarChart3,
    Calendar,
    CircleDollarSign,
    TrendingUp,
    University,
    Building2,
    ExternalLink,
    Award,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { TabItem } from '@/components/ui/Tabs';
import EntityProfilePage from '@/components/entity/EntityProfilePage';
import EntityHeader, { ActionButton, MetadataItem } from '@/components/entity/EntityHeader';
import StatDisplay, { StatItem } from '@/components/entity/StatDisplay';
import { formatCurrency, formatCSV } from '@/lib/format';
import { RecipientWithStats, GrantWithDetails, RECIPIENT_TYPE_LABELS } from '@/types/database';
import GrantCard from '@/components/grants/GrantCard';
import EntityAnalytics from '@/components/entity/EntityAnalytics';

interface RecipientDetailClientProps {
    recipient: RecipientWithStats;
    allGrants: GrantWithDetails[];
    topPrograms: any[];
    userId?: number;
}

export function RecipientDetailClient({
    recipient,
    allGrants,
    topPrograms,
    userId
}: RecipientDetailClientProps) {
    const router = useRouter();

    const location = formatCSV([
        recipient.city,
        recipient.province,
        recipient.country
    ].filter(Boolean) as string[]);

    const recipientType = recipient.type
        ? RECIPIENT_TYPE_LABELS[recipient.type] || 'Unknown'
        : 'Unknown';

    // Define tabs
    const tabs: TabItem[] = [
        {
            id: 'grants',
            label: 'Grants',
            icon: BookMarked,
            count: recipient.grant_count
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3
        }
    ];

    // Define metadata (institute link)
    const metadata: MetadataItem[] = [];
    if (recipient.research_organization_name && recipient.institute_id) {
        metadata.push({
            icon: University,
            text: recipient.research_organization_name,
            href: `/institutes/${recipient.institute_id}`
        });
    }

    // Define actions
    const actions: ActionButton[] = [
        {
            icon: ExternalLink,
            label: 'Search Online',
            onClick: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(recipient.legal_name + ' ' + (recipient.research_organization_name || ''))}`,
                '_blank'
            ),
            variant: 'outline',
        }
    ];

    // Render header
    const renderHeader = () => (
        <EntityHeader
            title={recipient.legal_name}
            icon={GraduationCap}
            entityType="recipient"
            entityId={recipient.recipient_id}
            location={location}
            metadata={metadata}
            isBookmarked={recipient.is_bookmarked}
            userId={userId}
            actions={actions}
            badge={{
                text: recipientType,
                icon: Building2
            }}
        />
    );

    // Render stats
    const renderStats = () => {
        const stats: StatItem[] = [
            {
                icon: BookMarked,
                label: 'Total Grants',
                value: recipient.grant_count || 0
            },
            {
                icon: CircleDollarSign,
                label: 'Total Funding',
                value: formatCurrency(recipient.total_funding || 0)
            },
            {
                icon: TrendingUp,
                label: 'Avg per Grant',
                value: formatCurrency(recipient.avg_funding || 0)
            },
            {
                icon: Calendar,
                label: 'Active Since',
                value: recipient.first_grant_date
                    ? new Date(recipient.first_grant_date).getFullYear().toString()
                    : 'N/A'
            }
        ];

        return <StatDisplay items={stats} columns={4} />;
    };

    // Render tab content
    const renderTabContent = (tabId: string) => {
        switch (tabId) {
            case 'grants':
                // Show top 20 grants in tab
                const topGrants = allGrants.slice(0, 20);

                return (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Grants ({allGrants.length})
                        </h2>

                        {allGrants.length === 0 ? (
                            <Card className="p-12">
                                <div className="text-center text-gray-500">
                                    <BookMarked className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg font-medium">No grants found</p>
                                    <p className="text-sm mt-1">This recipient has no recorded grants yet.</p>
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
                return (
                    <div className="space-y-6">
                        {/* Top Programs */}
                        {topPrograms.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Top Programs
                                </h2>
                                <div className="space-y-3">
                                    {topPrograms.map((program, index) => (
                                        <div key={program.prog_id || index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
                                                <Award className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {program.program_name}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {program.grant_count} {program.grant_count === 1 ? 'grant' : 'grants'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(program.total_funding)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Entity Analytics - pass ALL grants! */}
                        <EntityAnalytics
                            entity={recipient}
                            entityType="recipient"
                            grants={allGrants}
                        />
                    </div>
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
            defaultTab="grants"
            renderTabContent={renderTabContent}
        />
    );
}
