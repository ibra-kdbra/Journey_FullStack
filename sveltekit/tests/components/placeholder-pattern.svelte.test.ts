import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import PlaceholderPattern from '$components/PlaceholderPattern.svelte';

describe('PlaceholderPattern', () => {
  it('passes the class prop through to the svg', () => {
    const { container } = render(PlaceholderPattern, { props: { class: 'size-full' } });

    expect(container.querySelector('svg')?.getAttribute('class')).toBe('size-full');
  });

  it('points the rect fill at the pattern it defines', () => {
    const { container } = render(PlaceholderPattern, { props: { class: '' } });

    const id = container.querySelector('pattern')?.getAttribute('id');
    expect(id).toMatch(/^pattern-/);
    expect(container.querySelector('rect')?.getAttribute('fill')).toBe(`url(#${id})`);
  });

  it('gives each instance its own pattern id, so two on a page cannot collide', () => {
    const a = render(PlaceholderPattern, { props: { class: '' } });
    const b = render(PlaceholderPattern, { props: { class: '' } });

    expect(a.container.querySelector('pattern')?.id).not.toBe(b.container.querySelector('pattern')?.id);
  });
});
