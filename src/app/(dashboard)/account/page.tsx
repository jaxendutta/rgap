// src/app/(dashboard)/account/page.tsx
import { getCurrentUser, getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AccountManager from '@/components/account/AccountManager';
import AccountNotifications from '@/components/account/AccountNotifications';
import PageContainer from '@/components/layout/PageContainer';

interface AccountPageProps {
    searchParams: Promise<{
        verified?: string;
        tab?: string;
        history_page?: string;
        history_sort?: string;
        history_dir?: string;
        activity_page?: string; // ADDED
    }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const params = await searchParams;
    const session = await getSession();

    // Search History Config
    const historyPage = Number(params.history_page) || 1;
    const historyLimit = 15;
    const historyOffset = (historyPage - 1) * historyLimit;
    const historySortField = params.history_sort === 'result_count' ? 'result_count' : 'searched_at';
    const historySortDir = params.history_dir === 'asc' ? 'ASC' : 'DESC';

    // Activity Log Config (NEW)
    const activityPage = Number(params.activity_page) || 1;
    const activityLimit = 15;
    const activityOffset = (activityPage - 1) * activityLimit;

    // Run queries in parallel
    const [
        userResult,
        sessionsResult,
        auditResult,
        auditCountResult, // NEW
        searchResult,
        searchCountResult
    ] = await Promise.all([
        // 1. User
        db.query('SELECT * FROM users WHERE id = $1', [user.id]),

        // 2. Sessions
        db.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [user.id]),

        // 3. Activity Logs (Paginated)
        db.query(`
            SELECT * FROM user_audit_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
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
                totalActivityCount={Number(auditCountResult.rows[0]?.count || 0)} // NEW
                currentActivityPage={activityPage} // NEW

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
