import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ConsentProvider from '../../context/ConsentProvider';
import { setCookie } from '../../utils/cookies';
import { CONSENT_COOKIE } from '../../utils/storageKeys';
import { resetLoadedScripts } from '../../utils/loadExternalScript';
import SocialShare from './SocialShare';

function clearAllCookies(): void {
  for (const entry of document.cookie.split('; ')) {
    const name = entry.split('=')[0];
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

const renderShare = () =>
  render(
    <ConsentProvider>
      <SocialShare title="I scored 9/10" url="https://refuture.test/quiz" />
    </ConsentProvider>,
  );

/** Any DOM node sourced from a social vendor. */
function vendorNodes(): Element[] {
  return Array.from(document.querySelectorAll('iframe, script')).filter((node) => {
    const src = node.getAttribute('src') ?? '';
    return src.includes('facebook.com') || src.includes('twitter.com') || src.includes('twimg.com');
  });
}

beforeEach(() => {
  resetLoadedScripts();
  document.querySelectorAll('script').forEach((s) => s.remove());
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  clearAllCookies();
  vi.restoreAllMocks();
});

describe('SocialShare — consent gating', () => {
  it('AC-SOC-002: injects no vendor DOM at all when consent is denied', () => {
    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });

    renderShare();

    // The security-critical assertion: declining must mean nothing is ever
    // requested from Facebook or X, not merely that buttons are hidden.
    expect(vendorNodes()).toHaveLength(0);
    expect(screen.queryByTitle('Share on Facebook')).not.toBeInTheDocument();
  });

  it('AC-SOC-002: injects no vendor DOM before any decision is made', () => {
    renderShare();

    expect(vendorNodes()).toHaveLength(0);
  });

  it('AC-SOC-003: renders the Facebook plugin and the X control once granted', () => {
    setCookie(CONSENT_COOKIE, 'granted', { days: 365 });

    renderShare();

    const fbFrame = screen.getByTitle('Share on Facebook');
    expect(fbFrame).toBeInTheDocument();
    expect(fbFrame.getAttribute('src')).toContain('facebook.com/plugins/share_button.php');
    // The shared URL must be the one we passed, percent-encoded.
    expect(fbFrame.getAttribute('src')).toContain(encodeURIComponent('https://refuture.test/quiz'));

    const xLink = screen.getByRole('link', { name: /Share on X|Tweet/ });
    expect(xLink).toHaveAttribute('href', expect.stringContaining('twitter.com/intent/tweet'));
    expect(xLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('AC-SOC-004: always offers a working copy-link control', async () => {
    // userEvent.setup() installs its own clipboard stub as a non-writable
    // property, so it has to be spied on rather than reassigned.
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });
    renderShare();

    const copyButton = screen.getByRole('button', { name: 'Copy link' });
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith('https://refuture.test/quiz');
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('explains why the vendor buttons are missing when consent is declined', () => {
    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });

    renderShare();

    expect(screen.getByText(/because you declined social cookies/i)).toBeInTheDocument();
  });

  it('encodes the share text so a title with & or ? cannot break the intent URL', () => {
    setCookie(CONSENT_COOKIE, 'granted', { days: 365 });

    render(
      <ConsentProvider>
        <SocialShare title="Solar & wind: what now?" url="https://refuture.test/x" />
      </ConsentProvider>,
    );

    const href = screen.getByRole('link', { name: /Share on X|Tweet/ }).getAttribute('href') ?? '';
    expect(href).toContain(encodeURIComponent('Solar & wind: what now?'));
    // A raw '&' would terminate the text parameter early.
    expect(href).not.toContain('text=Solar & wind');
  });
});
