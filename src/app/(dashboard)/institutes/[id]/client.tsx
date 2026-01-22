// src/app/(dashboard)/institutes/[id]/client.tsx
'use client';

import {
    LuUniversity, LuUsers, LuBookMarked, LuCalendar, LuCircleDollarSign,
    LuExternalLink, LuScale,
} from 'react-icons/lu';
import { GrAnalytics } from 'react-icons/gr';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabItem } from '@/components/ui/Tabs';
import { EntityCard } from '@/components/entity/EntityCard';
import EntityProfilePage, { EntityHeader, StatDisplay, ActionButton, StatItem } from '@/components/entity/EntityProfilePage';
import { formatCurrency, formatCSV } from '@/lib/format';
import { InstituteWithStats, RecipientWithStats, GrantWithDetails } from '@/types/database';
import GrantCard from '@/components/grants/GrantCard';
import EntityAnalytics from '@/components/entity/EntityAnalytics';
import EntityList from '@/components/entity/EntityList';
import { getSortOptions } from '@/lib/utils';

interface InstituteDetailClientProps {
    institute: InstituteWithStats;
    recipients: RecipientWithStats[];
    grants: GrantWithDetails[];
    userId?: number;
    page: number;
    pageSize: number;
    activeTab: string;
}

export function InstituteDetailClient({
    institute,
    recipients,
    grants,
    userId,
    page,
    pageSize,
    activeTab
}: InstituteDetailClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const location = formatCSV([
        institute.city, institute.province, institute.country
    ].filter(Boolean) as string[]);

    const tabs: TabItem[] = [
        { id: 'recipients', label: 'Recipients', icon: LuUsers, count: institute.recipient_count },
        { id: 'grants', label: 'Grants', icon: LuBookMarked, count: institute.grant_count },
        { id: 'analytics', label: 'Analytics', icon: GrAnalytics }
    ];

    const actions: ActionButton[] = [
        {
            icon: LuExternalLink,
            label: 'Search',
            onClick: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(institute.name)}`, '_blank'),
            variant: 'outline',
        }
    ];

    const renderHeader = () => (
        <EntityHeader
            title={institute.name}
            icon={LuUniversity}
            entityType="institute"
            location={location}
        />
    );

    const renderStats = () => {
        const stats: StatItem[] = [
            { icon: LuUsers, label: 'Recipients', value: institute.recipient_count || 0 },
            { icon: LuBookMarked, label: 'Grants', value: institute.grant_count || 0 },
            { icon: LuCircleDollarSign, label: 'Total Funding', value: formatCurrency(institute.total_funding || 0) },
            { icon: LuCalendar, label: 'Active Since', value: institute.first_grant_date ? new Date(institute.first_grant_date).getFullYear().toString() : 'N/A' },
            { icon: LuScale, label: 'Avg Funding', value: formatCurrency(institute.avg_funding || 0) }
        ];
        return <StatDisplay items={stats} columns={4} />;
    };

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        params.delete('page');
        router.push(`?${params.toString()}`);
    };

    const renderTabContent = (tabId: string) => {
        switch (tabId) {
            case 'recipients':
                return (
                    <EntityList
                        entityType="recipient"
                        entities={recipients}
                        totalCount={institute.recipient_count || 0}
                        page={page}
                        pageSize={pageSize}
                        sortOptions={getSortOptions('recipient', 'institute')}
                    >
                        {recipients.map((recipient) => (
                            <EntityCard key={recipient.recipient_id} entity={recipient} entityType="recipient" />
                        ))}
                    </EntityList>
                );

            case 'grants':
                return (
                    <EntityList
                        entityType="grant"
                        entities={grants}
                        totalCount={institute.grant_count || 0}
                        page={page}
                        pageSize={pageSize}
                        sortOptions={getSortOptions('grant', 'institute')}
                    >
                        {grants.map((grant) => (
                            <GrantCard key={grant.grant_id} {...grant} />
                        ))}
                    </EntityList>
                );

            case 'analytics':
                return (
                    <EntityAnalytics
                        entity={institute}
                        entityType="institute"
                        grants={grants} // Simplified list if from lightweight query
                        recipients={[]} // We aren't passing full list here, analytics might need adjustment if it relies on this
                    />
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
            entityType="institute"
            entityId={institute.institute_id}
            isBookmarked={institute.is_bookmarked}
        />
    );
}
