// src/utils/responsive.ts
import { cn } from './cn';

/**
 * Utility classes for responsive visibility
 * 
 * hiddenOnMobile: Element is hidden on mobile but visible on larger screens (lg+)
 * hiddenOnTablet: Element is hidden on tablet but visible on mobile and desktop
 * hiddenOnDesktop: Element is hidden on desktop (lg+) but visible on smaller screens
 * visibleOnlyOnMobile: Element is only visible on mobile screens
 * visibleOnlyOnTablet: Element is only visible on tablet screens
 * visibleOnlyOnDesktop: Element is only visible on desktop screens
 */
export const responsive = {
  // Hide on specific breakpoints
  hiddenOnMobile: 'hidden sm:block',
  hiddenOnTablet: 'sm:hidden md:block',
  hiddenOnDesktop: 'lg:hidden',
  
  // Show only on specific breakpoints
  visibleOnlyOnMobile: 'block sm:hidden',
  visibleOnlyOnTablet: 'hidden sm:block md:hidden',
  visibleOnlyOnDesktop: 'hidden lg:block',
  
  // Flex variants
  flexOnMobile: 'flex sm:hidden',
  flexOnTablet: 'hidden sm:flex md:hidden',
  flexOnDesktop: 'hidden lg:flex',
  
  // Inline variants
  inlineOnMobile: 'inline sm:hidden',
  inlineOnTablet: 'hidden sm:inline md:hidden',
  inlineOnDesktop: 'hidden lg:inline',

  // Grid variants
  gridOnMobile: 'grid sm:hidden',
  gridOnTablet: 'hidden sm:grid md:hidden',
  gridOnDesktop: 'hidden lg:grid',

  // Padding variants
  padding: 'p-4 md:p-6 lg:p-6',
};

/**
 * Helper function to combine responsive classes with other class names
 */
export const responsiveClassName = (
  baseClasses: string,
  responsiveClass: keyof typeof responsive
): string => {
  return cn(baseClasses, responsive[responsiveClass]);
};

export default responsive;