import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { setCookie } from '../utils/cookies';
import { CONSENT_COOKIE } from '../utils/storageKeys';
import ConsentProvider from './ConsentProvider';
import { useConsent } from './consentContext';

function clearAllCookies(): void {
  for (const entry of document.cookie.split('; ')) {
    const name = entry.split('=')[0];
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
}

/** Test component that shows consent state as text. */
function GateProbe() {
  const { status, hasDecided, canLoadThirdParty } = useConsent();
  return (
    <span data-testid="gate">{`${status}|${hasDecided}|${canLoadThirdParty}`}</span>
  );
}

const renderProbe = () =>
  render(
    <ConsentProvider>
      <GateProbe />
    </ConsentProvider>,
  );

const gate = () => screen.getByTestId('gate').textContent;

describe('ConsentProvider — third-party gate', () => {
  afterEach(clearAllCookies);

  it('keeps the gate closed when no decision has been made', () => {
    renderProbe();

    expect(gate()).toBe('unset|false|false');
  });

  it('keeps the gate closed when consent was declined', () => {
    setCookie(CONSENT_COOKIE, 'denied', { days: 365 });

    renderProbe();

    expect(gate()).toBe('denied|true|false');
  });

  it('opens the gate only when consent was granted', () => {
    setCookie(CONSENT_COOKIE, 'granted', { days: 365 });

    renderProbe();

    expect(gate()).toBe('granted|true|true');
  });

  it('opens the gate immediately after the visitor accepts', async () => {
    const user = userEvent.setup();

    function Harness() {
      const { canLoadThirdParty, grant } = useConsent();
      return (
        <>
          <span data-testid="gate">{String(canLoadThirdParty)}</span>
          <button type="button" onClick={grant}>
            accept
          </button>
        </>
      );
    }

    render(
      <ConsentProvider>
        <Harness />
      </ConsentProvider>,
    );

    expect(screen.getByTestId('gate')).toHaveTextContent('false');

    await user.click(screen.getByRole('button', { name: 'accept' }));

    expect(screen.getByTestId('gate')).toHaveTextContent('true');
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=granted`);
  });

  it('closes the gate again when the decision is reset', async () => {
    const user = userEvent.setup();
    setCookie(CONSENT_COOKIE, 'granted', { days: 365 });

    function Harness() {
      const { canLoadThirdParty, reset } = useConsent();
      return (
        <>
          <span data-testid="gate">{String(canLoadThirdParty)}</span>
          <button type="button" onClick={reset}>
            reset
          </button>
        </>
      );
    }

    render(
      <ConsentProvider>
        <Harness />
      </ConsentProvider>,
    );

    expect(screen.getByTestId('gate')).toHaveTextContent('true');

    await user.click(screen.getByRole('button', { name: 'reset' }));

    expect(screen.getByTestId('gate')).toHaveTextContent('false');
    expect(document.cookie).not.toContain(CONSENT_COOKIE);
  });

  it('throws when used outside the provider', () => {
    expect(() => render(<GateProbe />)).toThrow(/must be called inside <ConsentProvider>/);
  });
});
