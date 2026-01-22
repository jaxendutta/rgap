// src/app/(dashboard)/institutes/[id]/client.tsx
'use client';

import {
    LuUniversity, LuUsers, LuBookMarked, LuCalendar, LuDollarSign,
    LuExternalLink, LuUserCheck, LuFileCheck,
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
import { TbFileDollar, TbUserDollar } from 'react-icons/tb';
import { formatDateDiff } from '@/lib/format';

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
        { id: 'analytics', label: 'Analytics', icon: GrAnalytics },
        { id: 'recipients', label: 'Recipients', icon: LuUsers, count: institute.recipient_count },
        { id: 'grants', label: 'Grants', icon: LuBookMarked, count: institute.grant_count },
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
        // Calculations
        const activeRecipients = institute.active_recipient_count || 0;
        const totalRecipients = institute.recipient_count || 1; // Avoid div by zero
        const activeRecipientPercent = ((activeRecipients / totalRecipients) * 100).toFixed(1);

        const activeGrants = institute.active_grant_count || 0;
        const totalGrants = institute.grant_count || 1; // Avoid div by zero
        const activeGrantPercent = ((activeGrants / totalGrants) * 100).toFixed(1);

        const avgFundingPerRecipient = institute.recipient_count > 0
            ? institute.total_funding / institute.recipient_count
            : 0;

        // Years Active calculation
        const startYear = institute.first_grant_date ? new Date(institute.first_grant_date).getFullYear() : null;
        const endYear = institute.latest_end_date ? new Date(institute.latest_end_date).getFullYear() : (new Date().getFullYear());
        const duration = formatDateDiff(institute.first_grant_date, institute.latest_end_date, 'short');

        const yearsActiveText = startYear
            ? [`${startYear} - ${endYear}`, duration]
            : ['N/A'];

        const stats: StatItem[] = [
            // Row 1
            { icon: LuUsers, label: 'Recipients', values: [institute.recipient_count || 0] },
            { icon: LuBookMarked, label: 'Grants', values: [institute.grant_count || 0] },
            { icon: LuDollarSign, label: 'Total Funding', values: [formatCurrency(institute.total_funding || 0)] },

            // Row 2
            { icon: TbFileDollar, label: 'Avg Funding / Grant', values: [formatCurrency(institute.avg_funding || 0)] },
            { icon: TbUserDollar, label: 'Avg Funding / Recipient', values: [formatCurrency(avgFundingPerRecipient)] },

            // Row 3 (Active stats)
            { icon: LuUserCheck, label: 'Active Recipients', values: [activeRecipients, `${activeRecipientPercent}%`] },
            { icon: LuFileCheck, label: 'Active Grants', values: [activeGrants, `${activeGrantPercent}%`] },

            // Row 4
            { icon: LuCalendar, label: 'Years Active', values: yearsActiveText },
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
                        grants={grants}
                        recipients={recipients}
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
