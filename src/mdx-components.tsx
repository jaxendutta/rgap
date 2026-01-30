import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        // Editorial Headings
        h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-8 mt-2">
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-gray-900 mt-12 mb-4">
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-lg font-medium text-gray-900 mt-8 mb-3">
                {children}
            </h3>
        ),

        // Relaxed Reading Text
        p: ({ children }) => (
            <p className="text-[15px] leading-7 text-gray-600 mb-6 font-normal">
                {children}
            </p>
        ),

        // "Hand-crafted" Lists
        ul: ({ children }) => (
            <ul className="space-y-3 mb-8 ml-1">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="list-decimal space-y-3 mb-8 ml-5 text-gray-600">{children}</ol>
        ),
        li: ({ children }) => (
            <li className="text-[15px] text-gray-600 leading-7 pl-2 relative before:content-['•'] before:absolute before:left-[-1rem] before:text-gray-300">
                {children}
            </li>
        ),

        // Distinct "Note" Callout (Replaces Blockquote)
        blockquote: ({ children }) => (
            <div className="my-8 p-4 pl-5 border-l-2 border-gray-900 bg-gray-50/50 rounded-r-lg text-gray-700 text-sm leading-6 italic">
                {children}
            </div>
        ),

        // Clean Code Snippets
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

        // High-Visibility Links
        a: ({ href, children }) => {
            const isInternal = href?.startsWith('/');
            const className = "font-medium text-gray-900 underline decoration-gray-300 underline-offset-4 decoration-2 hover:decoration-blue-500 hover:text-blue-600 transition-all";
            
            if (isInternal) {
                return <Link href={href || '#'} className={className}>{children}</Link>;
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>;
        },

        // Dividers
        hr: () => <hr className="my-12 border-gray-100" />,

        ...components,
    };
}