import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConsentProvider from '../../context/ConsentProvider';
import { setCookie } from '../../utils/cookies';
import { CONSENT_COOKIE } from '../../utils/storageKeys';
import { resetLoadedScripts } from '../../utils/loadExternalScript';
import SocialEmbed from './SocialEmbed';

function clearAllCookies(): void {
  for (const entry of document.cookie.split('; ')) {
    const name = entry.split('=')[0];
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

const renderEmbed = () =>
  render(
    <ConsentProvider>
      <SocialEmbed />
    </ConsentProvider>,
  );

beforeEach(() => {
  resetLoadedScripts();
  document.querySelectorAll('script').forEach((s) => s.remove());
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  clearAllCookies();
  vi.restoreAllMocks();
});

describe('SocialEmbed', () => {
  it('AC-SOC-005: shows a placeholder with an enable control when consent is denied', () => {
    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });

    renderEmbed();

    expect(screen.getByRole('button', { name: 'Enable social embeds' })).toBeInTheDocument();
    expect(screen.getByText(/You declined social cookies/i)).toBeInTheDocument();
    // Nothing is requested from the vendor while the placeholder is showing.
    expect(document.querySelectorAll('script').length).toBe(0);
  });

  it('AC-SOC-005: shows the pre-consent explanation before any decision', () => {
    renderEmbed();

    expect(screen.getByText(/Nothing is requested from their servers until you allow it/i))
      .toBeInTheDocument();
  });

  it('offers a direct link so the content is reachable without consenting', () => {
    renderEmbed();

    const link = screen.getByRole('link', { name: /Open on X instead/ });
    expect(link).toHaveAttribute('href', 'https://twitter.com/IEA');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('loads the widget script and renders the timeline anchor once granted', () => {
    setCookie(CONSENT_COOKIE, 'granted', { days: 365 });

    renderEmbed();

    const scripts = Array.from(document.querySelectorAll('script'));
    expect(scripts.some((s) => s.src === 'https://platform.twitter.com/widgets.js')).toBe(true);

    // Until widgets.js hydrates it, the anchor is still a working link.
    const anchor = screen.getByRole('link', { name: /Posts from @IEA/ });
    expect(anchor).toHaveAttribute('href', 'https://twitter.com/IEA');
    // Do Not Track is requested of the embed.
    expect(anchor).toHaveAttribute('data-dnt', 'true');
  });

  it('switches to the placeholder when the visitor grants consent', async () => {
    const user = userEvent.setup();
    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });

    renderEmbed();

    await user.click(screen.getByRole('button', { name: 'Enable social embeds' }));

    expect(screen.queryByRole('button', { name: 'Enable social embeds' })).not.toBeInTheDocument();
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=granted`);
  });
});
