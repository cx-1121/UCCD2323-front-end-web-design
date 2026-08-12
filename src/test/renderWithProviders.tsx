import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import ConsentProvider from '../context/ConsentProvider';

/**
 * Renders a component inside the same providers the real app mounts at its root.
 *
 * Any page containing `SocialShare` or `SocialEmbed` needs `ConsentProvider`,
 * because `useConsent()` throws outside it by design — a permissive default
 * would let a mis-mounted component load third-party scripts with no consent
 * record. That trade-off is worth it, but it means page-level tests must mirror
 * the real provider tree. Routing the render through one helper keeps that from
 * being rediscovered one failing test at a time.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <ConsentProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ConsentProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export default renderWithProviders;
