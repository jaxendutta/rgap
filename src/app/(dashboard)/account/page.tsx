import { getCurrentUser, getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Button from '@/components/ui/Button';
import AccountManager from '@/components/account/AccountManager';
import AccountNotifications from '@/components/account/AccountNotifications';
import { logoutAction } from '@/app/actions/auth';
import PageContainer from '@/components/layout/PageContainer';

export default async function AccountPage({ searchParams }: { searchParams: { verified?: string } }) {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const session = await getSession();

    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [user.id]);
    const fullUser = userResult.rows[0];

    const sessions = await db.query(
        `SELECT session_id, created_at, last_active_at, user_agent, ip_address, location, is_revoked 
         FROM sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [user.id]
    );

    const auditLogs = await db.query(
        `SELECT event_type, old_value, new_value, created_at, ip_address 
         FROM user_audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [user.id]
    );

    return (
        <PageContainer className="flex flex-col gap-4 md:gap-8 w-full">
            <AccountNotifications searchParams={searchParams} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900">Hi, {fullUser.name ? fullUser.name.split(' ')[0] : 'User'}</h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Manage your profile and security settings</p>
                </div>
                <form action={logoutAction}>
                    <Button variant="outline" className="w-full bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                        Sign Out
                    </Button>
                </form>
            </div>

            <AccountManager
                user={fullUser}
                sessions={sessions.rows}
                auditLogs={auditLogs.rows}
                currentSessionId={session.sessionId}
            />
        </PageContainer>
    );
}
