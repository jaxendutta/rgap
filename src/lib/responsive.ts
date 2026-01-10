'use client';

import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}

export function useBreakpoint() {
    const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth;
            if (width < 640) setBreakpoint('sm');
            else if (width < 768) setBreakpoint('md');
            else if (width < 1024) setBreakpoint('lg');
            else if (width < 1280) setBreakpoint('xl');
            else setBreakpoint('2xl');
        };

        checkBreakpoint();
        window.addEventListener('resize', checkBreakpoint);
        return () => window.removeEventListener('resize', checkBreakpoint);
    }, []);

    return breakpoint;
}
