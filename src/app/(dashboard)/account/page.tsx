import { getCurrentUser, getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import AccountManager from '@/components/account/AccountManager';
import AccountNotifications from '@/components/account/AccountNotifications';
import PageContainer from '@/components/layout/PageContainer';

export default async function AccountPage({ searchParams }: { searchParams: { verified?: string } }) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const session = await getSession();

    // Fetch all data in parallel for speed
    const [userResult, sessionsResult, auditResult, searchResult] = await Promise.all([
        db.query('SELECT * FROM users WHERE id = $1', [user.id]),
        db.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [user.id]),
        db.query('SELECT * FROM user_audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20', [user.id]),
        db.query('SELECT * FROM search_history WHERE user_id = $1 ORDER BY searched_at DESC LIMIT 15', [user.id])
    ]);

    return (
        <PageContainer className="flex flex-col gap-4">
            <AccountNotifications searchParams={searchParams} />

            <AccountManager
                user={userResult.rows[0]}
                sessions={sessionsResult.rows}
                auditLogs={auditResult.rows}
                searchHistory={searchResult.rows}
                currentSessionId={session.sessionId}
            />
        </PageContainer>
    );
}
