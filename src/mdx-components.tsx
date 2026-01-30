import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { LuLink } from 'react-icons/lu';
import { Alert } from '@/components/mdx/Alert';

// Helper for header links
const HeaderLink = ({ id, children, className }: { id?: string, children: React.ReactNode, className?: string }) => {
    if (!id) return <div className={className}>{children}</div>;
    return (
        <Link href={`#${id}`} className="group flex items-center gap-2 no-underline">
            <div className={className}>{children}</div>
            <LuLink className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Headers with Anchor Links
        h1: ({ children, id }) => (
            <HeaderLink id={id} className="text-xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2 md:mb-6 mt-2 md:mt-6 pb-2 border-b border-gray-100">
                {children}
            </HeaderLink>
        ),
        h2: ({ children, id }) => (
            <HeaderLink id={id} className="text-lg md:text-2xl font-semibold tracking-tight text-gray-900 mt-6 md:mt-10 mb-1.75 md:mb-4 pb-2 border-b border-gray-100">
                {children}
            </HeaderLink>
        ),
        h3: ({ children, id }) => (
            <HeaderLink id={id} className="text-base font-medium text-gray-900 mt-8 mb-1.5 md:mb-4">
                {children}
            </HeaderLink>
        ),

        // Paragraphs: Removed pb-6, responsive text size
        p: ({ children }) => (
            <p className="text-xs md:text-[15px] text-gray-600 mb-1 md:mb-5 font-normal">
                {children}
            </p>
        ),

        // Lists
        ul: ({ children }) => (
            <ul className="list-disc space-y-2 mb-6 ml-6 text-gray-600 marker:text-gray-400">
                {children}
            </ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal space-y-2 mb-6 ml-6 text-gray-600 marker:text-gray-400">
                {children}
            </ol>
        ),
        li: ({ children }) => (
            <li className="pl-1 leading-7 text-sm md:text-[15px]">{children}</li>
        ),

        // Code
        code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-800 text-[13px] font-mono border border-gray-200/50">
                {children}
            </code>
        ),
        pre: ({ children }) => (
            <pre className="overflow-x-auto p-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-sm font-mono leading-relaxed mb-8 shadow-sm">
                {children}
            </pre>
        ),

        // Links
        a: ({ href, children }) => {
            const isInternal = href?.startsWith('/');
            const className = "font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 decoration-2 hover:decoration-blue-500 hover:text-blue-600 transition-all";
            if (isInternal) {
                return <Link href={href || '#'} className={className}>{children}</Link>;
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
        },

        hr: () => <hr className="my-10 border-gray-100" />,

        Alert,

        ...components,
    };
}
