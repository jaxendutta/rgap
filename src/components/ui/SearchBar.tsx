'use client';

import { FiSearch, FiX } from 'react-icons/fi';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useState, useEffect } from 'react';
import InputField from './InputField';

interface SearchBarProps {
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ 
    placeholder = "Search...", 
    className = "" 
}: SearchBarProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    
    const [term, setTerm] = useState(searchParams.get('query')?.toString() || '');

    useEffect(() => {
        setTerm(searchParams.get('query')?.toString() || '');
    }, [searchParams]);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        
        if (term) {
            params.set('query', term);
            params.set('page', '1'); 
        } else {
            params.delete('query');
            params.delete('page');
        }

        replace(`${pathname}?${params.toString()}`);
    }, 400);

    return (
        <div className={`relative w-full ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiSearch className="size-5" />
            </div>
            <InputField
                placeholder={placeholder}
                value={term}
                onChange={(e) => {
                    setTerm(e.target.value);
                    handleSearch(e.target.value);
                }}
                className="w-full"
            />
            {term && (
                <button
                    onClick={() => { setTerm(''); handleSearch(''); }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <FiX className="size-4" />
                </button>
            )}
        </div>
    );
}
