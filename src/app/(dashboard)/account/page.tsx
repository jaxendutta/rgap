// src/app/(dashboard)/account/page.tsx
import { getCurrentUser, getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AccountManager from '@/components/account/AccountManager';
import AccountNotifications from '@/components/account/AccountNotifications';
import PageContainer from '@/components/layout/PageContainer';
import { DEFAULT_ITEM_PER_PAGE } from '@/constants/data';

interface AccountPageProps {
    searchParams: Promise<{
        verified?: string;
        tab?: string;

        // Search History Params
        history_page?: string;
        history_sort?: string;
        history_dir?: string;

        // Activity Log Params
        activity_page?: string;
        activity_sort?: string;
        activity_dir?: string;

        // Session Params
        session_sort?: string;
        session_dir?: string;
    }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const params = await searchParams;
    const session = await getSession();

    // 1. Search History Config
    const historyPage = Number(params.history_page) || 1;
    const historyLimit = DEFAULT_ITEM_PER_PAGE;
    const historyOffset = (historyPage - 1) * historyLimit;
    const historySortField = params.history_sort === 'result_count' ? 'result_count' : 'searched_at';
    const historySortDir = params.history_dir === 'asc' ? 'ASC' : 'DESC';

    // 2. Activity Log Config
    const activityPage = Number(params.activity_page) || 1;
    const activityLimit = DEFAULT_ITEM_PER_PAGE;
    const activityOffset = (activityPage - 1) * activityLimit;
    // Activity Sort (Default: created_at DESC)
    const validActivitySorts = ['created_at', 'event_type'];
    const activitySortField = validActivitySorts.includes(params.activity_sort || '') ? params.activity_sort! : 'created_at';
    const activitySortDir = params.activity_dir === 'asc' ? 'ASC' : 'DESC';

    // 3. Session Config
    // Session Sort (Default: created_at DESC)
    const validSessionSorts = ['created_at', 'last_active_at'];
    const sessionSortField = validSessionSorts.includes(params.session_sort || '') ? params.session_sort! : 'created_at';
    const sessionSortDir = params.session_dir === 'asc' ? 'ASC' : 'DESC';


    // Run queries in parallel
    const [
        userResult,
        sessionsResult,
        auditResult,
        auditCountResult,
        searchResult,
        searchCountResult
    ] = await Promise.all([
        // 1. User
        db.query('SELECT * FROM users WHERE id = $1', [user.id]),

        // 2. Sessions (Sorted)
        db.query(`
            SELECT * FROM sessions 
            WHERE user_id = $1 
            ORDER BY ${sessionSortField} ${sessionSortDir} 
            LIMIT 10
        `, [user.id]),

        // 3. Activity Logs (Paginated & Sorted)
        db.query(`
            SELECT * FROM user_audit_logs 
            WHERE user_id = $1 
            ORDER BY ${activitySortField} ${activitySortDir} 
            LIMIT $2 OFFSET $3
        `, [user.id, activityLimit, activityOffset]),

        // 4. Activity Logs Count
        db.query('SELECT COUNT(*) as count FROM user_audit_logs WHERE user_id = $1', [user.id]),

        // 5. Search History (Paginated)
        db.query(`
            SELECT * FROM search_history 
            WHERE user_id = $1 
            ORDER BY ${historySortField} ${historySortDir} 
            LIMIT $2 OFFSET $3
        `, [user.id, historyLimit, historyOffset]),

        // 6. Search History Count
        db.query('SELECT COUNT(*) as count FROM search_history WHERE user_id = $1', [user.id])
    ]);

    return (
        <PageContainer className="flex flex-col gap-4">
            <AccountNotifications searchParams={params} />

            <AccountManager
                user={userResult.rows[0]}
                sessions={sessionsResult.rows}

                // Activity Log Props
                auditLogs={auditResult.rows}
                totalActivityCount={Number(auditCountResult.rows[0]?.count || 0)}
                currentActivityPage={activityPage}
                currentActivitySort={activitySortField}
                currentActivityDir={activitySortDir === 'ASC' ? 'asc' : 'desc'}

                // Session Props
                currentSessionSort={sessionSortField}
                currentSessionDir={sessionSortDir === 'ASC' ? 'asc' : 'desc'}

                // Search History Props
                searchHistory={searchResult.rows}
                totalHistoryCount={Number(searchCountResult.rows[0]?.count || 0)}
                currentHistoryPage={historyPage}

                currentSessionId={session.sessionId}
                initialTab={params.tab || 'profile'}
            />
        </PageContainer>
    );
}
