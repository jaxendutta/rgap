// src/app/(dashboard)/recipients/[id]/client.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    LuGraduationCap, LuBookMarked, LuCalendar,
    LuCircleDollarSign, LuAward, LuUniversity, LuBuilding2, LuScale,
} from 'react-icons/lu';
import { TbWorldSearch } from 'react-icons/tb';
import { GrAnalytics } from 'react-icons/gr';
import { Card } from '@/components/ui/Card';
import { TabItem } from '@/components/ui/Tabs';
import EntityProfilePage, { EntityHeader, StatDisplay, ActionButton, MetadataItem, StatItem } from '@/components/entity/EntityProfilePage';
import { formatCurrency, formatCSV } from '@/lib/format';
import { RecipientWithStats, GrantWithDetails, RECIPIENT_TYPE_LABELS } from '@/types/database';
import GrantCard from '@/components/grants/GrantCard';
import EntityAnalytics from '@/components/entity/EntityAnalytics';
import EntityList from '@/components/entity/EntityList';
import { getSortOptions } from '@/lib/utils';

interface RecipientDetailClientProps {
    recipient: RecipientWithStats;
    grants: GrantWithDetails[];
    topPrograms: any[];
    userId?: number;
    page: number;
    pageSize: number;
    activeTab: string;
}

export function RecipientDetailClient({
    recipient,
    grants,
    topPrograms,
    page,
    pageSize,
    activeTab
}: RecipientDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const location = formatCSV([
        recipient.city, recipient.province, recipient.country
    ].filter(Boolean) as string[]);

    const recipientType = recipient.type
        ? RECIPIENT_TYPE_LABELS[recipient.type] || 'Unknown'
        : 'Unknown';

    const tabs: TabItem[] = [
        { id: 'analytics', label: 'Analytics', icon: GrAnalytics },
        { id: 'grants', label: 'Grants', icon: LuBookMarked, count: recipient.grant_count },
    ];

    const metadata: MetadataItem[] = [];
    if (recipient.research_organization_name && recipient.institute_id) {
        metadata.push({
            icon: LuUniversity,
            text: recipient.research_organization_name,
            href: `/institutes/${recipient.institute_id}`
        });
    }

    const actions: ActionButton[] = [
        {
            icon: TbWorldSearch,
            label: 'Search',
            onClick: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(recipient.legal_name + ' ' + (recipient.research_organization_name || ''))}`, '_blank'),
            variant: 'outline',
        }
    ];

    const renderHeader = () => (
        <EntityHeader
            title={recipient.legal_name}
            icon={LuGraduationCap}
            entityType="recipient"
            location={location}
            metadata={metadata}
            badge={{ text: recipientType, icon: LuBuilding2 }}
        />
    );

    const renderStats = () => {
        const stats: StatItem[] = [
            { icon: LuBookMarked, label: 'Total Grants', value: recipient.grant_count || 0 },
            { icon: LuCircleDollarSign, label: 'Total Funding', value: formatCurrency(recipient.total_funding || 0) },
            { icon: LuScale, label: 'Average Grant', value: formatCurrency(recipient.avg_funding || 0) },
            { icon: LuCalendar, label: 'Active Since', value: recipient.first_grant_date ? new Date(recipient.first_grant_date).getFullYear().toString() : 'N/A' }
        ];
        return <StatDisplay items={stats} columns={4} />;
    };

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        params.delete('page'); // Reset page on tab change
        router.push(`?${params.toString()}`);
    };

    const renderTabContent = (tabId: string) => {
        switch (tabId) {
            case 'analytics':
                return (
                    <div className="space-y-4 md:space-y-6">
                        <EntityAnalytics
                            entity={recipient}
                            entityType="recipient"
                            grants={grants}
                        />
                        {topPrograms.length > 0 && (
                            <Card className="p-2 md:p-6">
                                <h2 className="flex flex-row items-center gap-2 text-base md:text-lg font-semibold text-gray-900 mb-4 p-1 md:p-0">
                                    <LuAward className="h-4 md:h-5 w-4 md:w-5 text-purple-600" />
                                    Top Programs
                                </h2>
                                <div className="space-y-3">
                                    {topPrograms.map((program, index) => (
                                        <div key={program.prog_id || index} className="flex items-center gap-2 md:gap-4 p-2 md:p-4 bg-gray-100 rounded-3xl">
                                            <div className="flex-shrink-0">
                                                <span className="size-6 md:size-10 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full font-semibold text-sm md:text-base">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm md:text-base">{program.program_name}</p>
                                                <p className="text-xs md:text-sm text-gray-600">{program.grant_count} grants</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm md:text-base font-semibold text-gray-900">{formatCurrency(program.total_funding)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>
                );

            case 'grants':
                return (
                    <EntityList
                        entityType="grant"
                        entities={grants}
                        totalCount={recipient.grant_count || 0}
                        page={page}
                        pageSize={pageSize}
                        sortOptions={getSortOptions('grant', 'recipient')}
                    >
                        {grants.map((grant) => (
                            <GrantCard key={grant.grant_id} {...grant} />
                        ))}
                    </EntityList>
                );

            default: return null;
        }
    };

    return (
        <EntityProfilePage
            renderHeader={renderHeader}
            renderStats={renderStats}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            renderTabContent={renderTabContent}
            actions={actions}
            entityType="recipient"
            entityId={recipient.recipient_id}
            isBookmarked={recipient.is_bookmarked}
        />
    );
}
