import { useReveal } from '../../hooks/useReveal';
import styles from './Accession.module.css';

/**
 * Wires a page up to the interior's one entrance.
 *
 * `<Settle>` marks what should settle in; this puts the observer on the page
 * that owns them and hands it the resolved class from the same stylesheet the
 * markers came from. Pages must not pass their own class — the un-settled and
 * settled states are two halves of one rule in Accession.module.css, and a
 * page-local class would only ever match the half it declared.
 *
 * @param enabled Pass false while an intro sequence is still running: content
 *   above the fold would otherwise resolve behind the curtain and land
 *   already-finished when it lifts.
 */
export function useSettle<T extends HTMLElement>(enabled = true) {
  return useReveal<T>(styles.settled, enabled);
}

export default useSettle;
