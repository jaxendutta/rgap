// src/app/privacy/page.tsx
import { Metadata } from 'next';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import PrivacyPolicyContent from './privacy-policy.mdx';

export const metadata: Metadata = {
    title: 'Privacy Policy | RGAP',
    description: 'How RGAP collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Privacy Policy"
                subtitle="Last updated July 2, 2026"
            />

            <Card>
                <Card.Content className="space-y-8">
                    <PrivacyPolicyContent />
                </Card.Content>
            </Card>
        </PageContainer>
    );
}
