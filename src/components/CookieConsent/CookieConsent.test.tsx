import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import ConsentProvider from '../../context/ConsentProvider';
import { CONSENT_COOKIE } from '../../utils/storageKeys';
import { setCookie } from '../../utils/cookies';
import CookieConsent from './CookieConsent';

function clearAllCookies(): void {
  for (const entry of document.cookie.split('; ')) {
    const name = entry.split('=')[0];
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

const renderBanner = () =>
  render(
    <ConsentProvider>
      <CookieConsent />
    </ConsentProvider>,
  );

describe('CookieConsent', () => {
  afterEach(clearAllCookies);

  it('AC-STO-003: renders a labelled dialog when no decision cookie exists', () => {
    renderBanner();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAccessibleName('Cookies & social embeds');
  });

  it('AC-STO-003: stays hidden when a decision cookie already exists', () => {
    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });

    renderBanner();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('AC-STO-004: writes granted and unmounts when Accept is clicked', async () => {
    const user = userEvent.setup();
    renderBanner();

    await user.click(screen.getByRole('button', { name: 'Accept' }));

    expect(document.cookie).toContain(`${CONSENT_COOKIE}=granted`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('AC-STO-004: writes denied and unmounts when Decline is clicked', async () => {
    const user = userEvent.setup();
    renderBanner();

    await user.click(screen.getByRole('button', { name: 'Decline' }));

    expect(document.cookie).toContain(`${CONSENT_COOKIE}=denied`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('treats a tampered cookie value as no decision at all', () => {
    setCookie(CONSENT_COOKIE, 'yes-please', { days: 365 });

    renderBanner();

    // Only the two values we write may count as a decision; anything else
    // must re-prompt rather than be interpreted as consent.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('offers Decline as a real button in the tab order, not a hidden opt-out', () => {
    renderBanner();

    const decline = screen.getByRole('button', { name: 'Decline' });
    expect(decline).toBeInTheDocument();
    expect(decline).not.toHaveAttribute('tabindex', '-1');
  });
});
