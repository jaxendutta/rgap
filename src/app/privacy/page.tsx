// src/app/privacy/page.tsx
import { Metadata } from 'next';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
    title: 'Privacy Policy | RGAP',
    description: 'How RGAP collects, uses, and protects your data.',
};

const LAST_UPDATED = 'July 2, 2026';
const CONTACT_EMAIL = 'privacy@rgap.anirban.ca';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
        </section>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Privacy Policy"
                subtitle={`Last updated ${LAST_UPDATED}`}
            />

            <Card>
                <Card.Content className="space-y-8">
                    <Section title="Overview">
                        <p>
                            RGAP (Research Grant Analytics Platform) lets you browse and analyze publicly available
                            Canadian federal research grant data from NSERC, CIHR, and SSHRC. You can search, filter,
                            and explore all of this grant data without creating an account. An account is only needed
                            if you want to save searches, bookmark grants, or access other personalized features.
                            This page explains what data we collect when you use RGAP, and how it&apos;s used.
                        </p>
                    </Section>

                    <Section title="Grant, recipient, and institute data">
                        <p>
                            The grant, recipient, and institute records shown throughout RGAP are public open data
                            published by the Government of Canada&apos;s research funding agencies. This is not
                            personal data collected by RGAP &mdash; it&apos;s sourced directly from official government
                            datasets and refreshed periodically. If you believe a record about you is inaccurate,
                            the correction needs to be made at the source (the relevant funding agency), not through RGAP.
                        </p>
                    </Section>

                    <Section title="Information you provide when creating an account">
                        <p>If you choose to create an account, we collect and store:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Your name and email address</li>
                            <li>A securely hashed version of your password (we never store your password itself)</li>
                        </ul>
                        <p>
                            We use your email address to verify your account, send password reset links if you request
                            one, and confirm changes to your name, email, or password. We do not send marketing emails
                            and do not share your email address with third parties for advertising purposes.
                        </p>
                    </Section>

                    <Section title="Sessions and security">
                        <p>
                            When you sign in, we set a single encrypted, HTTP-only session cookie to keep you logged
                            in. This cookie is not used for advertising or cross-site tracking. For security purposes
                            (e.g. letting you review or revoke active sessions, and detecting suspicious activity), we
                            also log your approximate location (city/country, derived from IP address), browser/device
                            information, and timestamps of security-relevant events such as sign-ins and password
                            changes.
                        </p>
                    </Section>

                    <Section title="Bookmarks and search history">
                        <p>
                            If you&apos;re signed in, RGAP lets you bookmark grants, recipients, institutes, and
                            searches, optionally with your own free-text notes attached. We also keep a history of
                            your searches so you can revisit them later. None of this is shared with other users or
                            used for anything beyond providing these features back to you. Aggregate, anonymized
                            search counts (not tied to any individual) are used to power the "Popular Searches"
                            feature shown to all visitors.
                        </p>
                    </Section>

                    <Section title="Cookies">
                        <p>
                            RGAP uses one essential cookie to keep you signed in. We do not use advertising cookies,
                            third-party analytics cookies, or cross-site tracking cookies of any kind.
                        </p>
                    </Section>

                    <Section title="Who we share data with">
                        <p>
                            We don&apos;t sell or share your personal data with advertisers. RGAP relies on a small
                            number of infrastructure providers to operate:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Supabase</strong> &mdash; hosts our database, where account and activity data described above is stored.</li>
                            <li><strong>Vercel</strong> &mdash; hosts the website itself and may log standard web server request data (e.g. IP address, timestamps) for operating and securing the service.</li>
                            <li><strong>Resend</strong> &mdash; delivers the transactional emails described above (verification, password reset, account notices).</li>
                        </ul>
                    </Section>

                    <Section title="Data retention and deletion">
                        <p>
                            We keep your account data for as long as your account exists. You can permanently delete
                            your account at any time from your account settings &mdash; this immediately and
                            permanently removes your account, sessions, bookmarks, and search history from our
                            database. This action cannot be undone.
                        </p>
                    </Section>

                    <Section title="Children's privacy">
                        <p>
                            RGAP is not directed at children and we do not knowingly collect data from children under 13.
                        </p>
                    </Section>

                    <Section title="Changes to this policy">
                        <p>
                            If this policy changes, we&apos;ll update the &quot;Last updated&quot; date at the top of
                            this page.
                        </p>
                    </Section>

                    <Section title="Contact">
                        <p>
                            Questions about this policy or your data can be sent to{' '}
                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 hover:underline">
                                {CONTACT_EMAIL}
                            </a>.
                        </p>
                    </Section>
                </Card.Content>
            </Card>
        </PageContainer>
    );
}
