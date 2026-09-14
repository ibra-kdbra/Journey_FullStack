import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import SEO from '$components/SEO.svelte';

/**
 * SEO renders entirely into <svelte:head>, so there is nothing in the
 * container to assert against — the assertions read `document.head`, which is
 * what the component actually writes to.
 */
const meta = (selector: string) => document.head.querySelector<HTMLMetaElement>(selector)?.content;

describe('SEO', () => {
  it('suffixes a supplied title with the site name', () => {
    render(SEO, { props: { title: 'Dashboard' } });

    expect(document.title).toBe('Dashboard | SvelteKit Omakase');
    expect(meta('meta[name="title"]')).toBe('Dashboard | SvelteKit Omakase');
    expect(meta('meta[property="og:title"]')).toBe('Dashboard | SvelteKit Omakase');
    expect(meta('meta[property="twitter:title"]')).toBe('Dashboard | SvelteKit Omakase');
  });

  it('falls back to the bare site name when the title is empty', () => {
    render(SEO, { props: { title: '' } });

    expect(document.title).toBe('SvelteKit Omakase');
  });

  it('defaults description, and lets a caller override it', () => {
    render(SEO, { props: { title: 'x' } });
    expect(meta('meta[name="description"]')).toMatch(/starter project/);

    document.head.innerHTML = '';
    render(SEO, { props: { title: 'x', description: 'custom copy' } });
    expect(meta('meta[name="description"]')).toBe('custom copy');
    expect(meta('meta[property="og:description"]')).toBe('custom copy');
  });

  it('mirrors url into the og and twitter tags', () => {
    render(SEO, { props: { title: 'x', url: 'https://example.invalid/page' } });

    expect(meta('meta[property="og:url"]')).toBe('https://example.invalid/page');
    expect(meta('meta[property="twitter:url"]')).toBe('https://example.invalid/page');
  });

  it('marks the page indexable', () => {
    render(SEO, { props: { title: 'x' } });

    expect(meta('meta[name="robots"]')).toBe('index, follow');
    expect(meta('meta[property="og:type"]')).toBe('website');
  });
});
