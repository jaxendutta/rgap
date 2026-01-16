// src/app/(dashboard)/recipients/[id]/client.tsx
'use client';

import {
    LuGraduationCap,
    LuBookMarked,
    LuChartBar,
    LuCalendar,
    LuCircleDollarSign,
    LuAward,
    LuUniversity,
    LuBuilding2,
    LuScale
} from 'react-icons/lu';
import { TbWorldSearch } from 'react-icons/tb';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { TabItem } from '@/components/ui/Tabs';
import EntityProfilePage, { EntityHeader, StatDisplay, ActionButton, MetadataItem, StatItem } from '@/components/entity/EntityProfilePage';
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
            icon: LuBookMarked,
            count: recipient.grant_count
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: LuChartBar,
        }
    ];

    // Define metadata (institute link)
    const metadata: MetadataItem[] = [];
    if (recipient.research_organization_name && recipient.institute_id) {
        metadata.push({
            icon: LuUniversity,
            text: recipient.research_organization_name,
            href: `/institutes/${recipient.institute_id}`
        });
    }

    // Define actions
    const actions: ActionButton[] = [
        {
            icon: TbWorldSearch,
            label: 'Search',
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
            icon={LuGraduationCap}
            entityType="recipient"
            location={location}
            metadata={metadata}
            badge={{
                text: recipientType,
                icon: LuBuilding2
            }}
        />
    );

    // Render stats
    const renderStats = () => {
        const stats: StatItem[] = [
            {
                icon: LuBookMarked,
                label: 'Total Grants',
                value: recipient.grant_count || 0
            },
            {
                icon: LuCircleDollarSign,
                label: 'Total Funding',
                value: formatCurrency(recipient.total_funding || 0)
            },
            {
                icon: LuScale,
                label: 'Average Grant',
                value: formatCurrency(recipient.avg_funding || 0)
            },
            {
                icon: LuCalendar,
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
                                    <LuBookMarked className="h-12 w-12 mx-auto mb-4 text-gray-400" />
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
                    <div className="space-y-4 md:space-y-6">
                        {/* Entity Analytics - pass ALL grants! */}
                        <EntityAnalytics
                            entity={recipient}
                            entityType="recipient"
                            grants={allGrants}
                        />

                        {/* Top Programs */}
                        {topPrograms.length > 0 && (
                            <Card className="p-2 md:p-6">
                                <h2 className="flex flex-row items-center gap-2 text-base md:text-lg font-semibold text-gray-900 mb-4 p-1 md:p-0">
                                    <LuAward className="h-4 md:h-5 w-4 md:w-5 text-purple-600" />
                                    Top Programs
                                </h2>
                                <div className="space-y-3">
                                    {topPrograms.map((program, index) => (
                                        <div key={program.prog_id || index} className="flex items-center gap-2 md:gap-4 p-2 md:p-4 bg-gray-100 rounded-2xl">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm md:text-base">
                                                    {program.program_name}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-600">
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
            actions={actions}
            entityType="recipient"
            entityId={recipient.recipient_id}
            isBookmarked={recipient.is_bookmarked}
        />
    );
}
