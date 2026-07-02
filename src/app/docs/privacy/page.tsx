import type { Metadata } from 'next';
import PrivacyPolicyContent from '@/app/privacy/privacy-policy.mdx';

export const metadata: Metadata = {
    title: 'Privacy Policy | RGAP Docs',
    description: 'How RGAP collects, uses, and protects your data.',
};

export default function DocsPrivacyPage() {
    return <PrivacyPolicyContent />;
}