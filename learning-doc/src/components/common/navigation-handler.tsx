"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Component to handle navigation and reload the page when necessary
 * to synchronize themes between different layouts
 */
export function NavigationHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Handler for clicks on home links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (!link) return;

      const href = link.getAttribute('href');

      // If at docs/docs/mobile-docs and home link is clicked
      if (href === '/' && (
        pathname?.startsWith('/docs') ||
        pathname?.startsWith('/docs') ||
        pathname?.startsWith('/mobile-docs')
      )) {
        e.preventDefault();
        window.location.href = '/';
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [pathname]);

  return null;
}
