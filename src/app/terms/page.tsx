// src/app/terms/page.tsx
import { Metadata } from 'next';
import PageContainer from '@/components/layout/PageContainer';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import TermsAndConditionsContent from './terms-and-conditions.mdx';

export const metadata: Metadata = {
    title: 'Terms & Conditions | RGAP',
    description: 'The terms that govern your use of RGAP.',
};

export default function TermsAndConditionsPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Terms & Conditions"
                subtitle="Last updated July 4, 2026"
            />

            <Card>
                <Card.Content className="space-y-8">
                    <TermsAndConditionsContent />
                </Card.Content>
            </Card>
        </PageContainer>
    );
}
