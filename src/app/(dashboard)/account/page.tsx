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
        tab?: string; // CHANGED
        history_page?: string;
        history_sort?: string;
        history_dir?: string;
    }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const params = await searchParams;
    const session = await getSession();

    // History Config
    const historyPage = Number(params.history_page) || 1;
    const limit = 15;
    const offset = (historyPage - 1) * limit;

    // Sort Config
    const sortField = params.history_sort === 'result_count' ? 'result_count' : 'searched_at';
    const sortDir = params.history_dir === 'asc' ? 'ASC' : 'DESC';

    const [userResult, sessionsResult, auditResult, searchResult, countResult] = await Promise.all([
        db.query('SELECT * FROM users WHERE id = $1', [user.id]),
        db.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [user.id]),
        db.query('SELECT * FROM user_audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [user.id]),
        db.query(`
            SELECT * FROM search_history 
            WHERE user_id = $1 
            ORDER BY ${sortField} ${sortDir} 
            LIMIT $2 OFFSET $3
        `, [user.id, limit, offset]),
        db.query('SELECT COUNT(*) as count FROM search_history WHERE user_id = $1', [user.id])
    ]);

    return (
        <PageContainer className="flex flex-col gap-4">
            <AccountNotifications searchParams={params} />

            <AccountManager
                user={userResult.rows[0]}
                sessions={sessionsResult.rows}
                auditLogs={auditResult.rows}
                searchHistory={searchResult.rows}
                currentSessionId={session.sessionId}
                totalHistoryCount={Number(countResult.rows[0]?.count || 0)}
                currentHistoryPage={historyPage}
                initialTab={params.tab || 'profile'}
            />
        </PageContainer>
    );
}
