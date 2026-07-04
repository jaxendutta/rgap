import type { Metadata } from 'next';
import TermsAndConditionsContent from '@/app/terms/terms-and-conditions.mdx';

export const metadata: Metadata = {
    title: 'Terms & Conditions | RGAP Docs',
    description: 'The terms that govern your use of RGAP.',
};

export default function DocsTermsPage() {
    return <TermsAndConditionsContent />;
}
