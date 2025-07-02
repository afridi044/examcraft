import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Custom hook to scroll to top smoothly when pathname changes
 * This ensures users start at the top when navigating between pages
 */
export function useScrollToTop() {
  const pathname = usePathname();
  const prevPathnameRef = useRef<string>('');

  useEffect(() => {
    // Only scroll if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        // Smooth scroll to top when pathname changes
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      });
    }
  }, [pathname]);
} 