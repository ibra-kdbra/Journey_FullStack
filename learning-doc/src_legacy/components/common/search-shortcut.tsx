"use client";

import { useEffect } from "react";

export function SearchShortcut() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                const searchInput = document.querySelector<HTMLInputElement>(
                    'input[type="search"], button[aria-label="Search documentation"], .nextra-search input'
                );
                if (searchInput) {
                    if (searchInput.tagName === 'BUTTON') {
                        searchInput.click();
                    } else {
                        searchInput.focus();
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return null;
}
