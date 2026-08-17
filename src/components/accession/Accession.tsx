import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowGlyph } from '../icons';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from '../../hooks/useInView';
import { useSheetLift } from '../../hooks/useSheetLift';
import styles from './Accession.module.css';

/**
 * THE ACCESSION GRAMMAR — the interior's shared vocabulary.
 *
 * The revisit surface built one room: a seed vault holding pressed specimens
 * of the fossil century. These are that room's parts, generalised so every
 * interior route can be built from them, and stripped of colour so the ladder
 * in styles/chapters.css can re-ink them as the story climbs from the cold
 * stacks out into daylight.
 *
 * Components only in this module: no maps, no constants alongside them, so
 * react-refresh can hot-replace it cleanly.
 */

/* ==========================================================================
   Chapter
   ========================================================================== */

type Stop =
  | 'stacks'
  | 'soot'
  | 'haze'
  | 'thaw'
  | 'firstlight'
  | 'daylight'
  | 'sky'
  | 'living';

type ChapterProps = {
  /** Where this section stands on the ladder. Re-inks everything inside it. */
  stop: Stop;
  /**
   * The stop directly above. This section's top edge dissolves out of the
   * colour the two stops share, rather than out of the neighbour's flat
   * ground — half the travel happens above the boundary and half below, which
   * is what stops it reading as a band. Omit on the first chapter of a page.
   */
  from?: Stop;
  /** The stop directly below. Same crossing, at the bottom edge. */
  to?: Stop;
  /** Full-viewport opening chapter: no blend above it, nothing to climb out of. */
  opening?: boolean;
  id?: string;
  'aria-label'?: string;
  /** For a chapter whose own visible heading is its label. Preferred over
      `aria-label`: a heading the reader can see and a name only the screen
      reader hears should not be two different strings. */
  'aria-labelledby'?: string;
  className?: string;
  children: ReactNode;
};

export function Chapter({
  stop,
  from,
  to,
  opening = false,
  id,
  className,
  children,
  ...rest
}: ChapterProps) {
  return (
    <section
      id={id}
      data-chapter={stop}
      data-from={from}
      data-to={to}
      className={[styles.chapter, opening && styles.chapterOpening, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span className={styles.lift} aria-hidden="true" />
      <span className={styles.grain} aria-hidden="true" />
      {children}
    </section>
  );
}

/** The reading column. */
export function Column({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.inner, className].filter(Boolean).join(' ')}>{children}</div>;
}

/** The working bench — editorial splits, filing runs, figure rows. */
export function Bench({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.wide, className].filter(Boolean).join(' ')}>{children}</div>;
}

/* ==========================================================================
   Entrance

   One authored entrance for the whole interior: things settle up out of the
   ground they belong to. `useReveal` on the page stamps the resolved class
   from outside React, so this stays off the render path.
   ========================================================================== */

type SettleProps = {
  as?: 'div' | 'article' | 'header' | 'footer' | 'li' | 'p' | 'figure';
  /** Stagger position within its group. 1-based; 0 means no delay. */
  index?: number;
  /**
   * Enter on mount rather than on scroll. Required for anything in the first
   * viewport: the reveal band stops short of the fold, so content low in the
   * opening screen never intersects and would sit invisible until the reader
   * scrolls past it.
   */
  onMount?: boolean;
  className?: string;
  children: ReactNode;
};

export function Settle({
  as: Tag = 'div',
  index = 0,
  onMount = false,
  className,
  children,
}: SettleProps) {
  return (
    <Tag
      // Withheld when entering on mount, so the observer never claims it.
      data-reveal={onMount ? undefined : ''}
      style={{ '--reveal-index': index } as CSSProperties}
      className={[onMount ? styles.settleMount : styles.settle, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}

/* ==========================================================================
   Type roles
   ========================================================================== */

type Scale = 'display' | 'section' | 'plate';

/**
 * A stamped heading. Archivo Narrow, rubber-cut caps — short strings only: a
 * condensed gothic in caps stops reading somewhere around six words.
 */
export function Stamped({
  as: Tag = 'h2',
  scale = 'section',
  id,
  className,
  children,
}: {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  scale?: Scale;
  /** For headings that label a region via aria-labelledby. */
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const scaleClass =
    scale === 'display'
      ? styles.stampedDisplay
      : scale === 'plate'
        ? styles.stampedPlate
        : styles.stampedSection;

  return (
    <Tag id={id} className={[styles.stamped, scaleClass, className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}

/**
 * The narrative voice. The site's statements are determinations — what the
 * record concludes — so they are typed, one line per line, and the line the
 * passage turns on is underscored the way a typist marks a determination.
 */
export function Typed({
  lines,
  className,
}: {
  /** The last line is the determination unless `false` is passed for it. */
  lines: (string | [string, boolean])[];
  className?: string;
}) {
  return (
    <p className={[styles.typed, className].filter(Boolean).join(' ')}>
      {lines.map((entry, i) => {
        const [text, determined] = Array.isArray(entry)
          ? entry
          : [entry, i === lines.length - 1];
        return (
          <span key={text} className={determined ? styles.typedDetermined : undefined}>
            {text}
            {i < lines.length - 1 && <br />}
          </span>
        );
      })}
    </p>
  );
}

/** Explanatory prose. The only role allowed to run long. */
export function Prose({
  onObject = false,
  className,
  children,
}: {
  onObject?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={[styles.set, onObject && styles.setOnObject, className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </p>
  );
}

/**
 * An instrument reading: a unit, an accession number, a column head, a state,
 * a source credit. Never an eyebrow — it is not a label sitting above a
 * heading, it is a fact the reader can act on.
 */
export function Instrument({
  ruled = false,
  onObject = false,
  className,
  children,
}: {
  ruled?: boolean;
  onObject?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={[
        styles.instrument,
        ruled && styles.instrumentRuled,
        onObject && styles.instrumentOnObject,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {ruled ? <span>{children}</span> : children}
    </p>
  );
}

/* ==========================================================================
   Paper objects
   ========================================================================== */

/**
 * A paper object in the room. Square, cut edge, its own ground, and a long
 * cast shadow onto the floor. `live` gives it the pointer tilt of a mounted
 * sheet lifted under the light.
 */
export function Sheet({
  live = false,
  className,
  children,
}: {
  live?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useSheetLift<HTMLDivElement>();

  return (
    <div
      ref={live ? ref : undefined}
      className={[styles.sheet, live && styles.sheetLive, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

/** The head of a sheet: what it is on the left, what it is numbered on the right. */
export function SheetHead({ of: title, no }: { of: ReactNode; no?: ReactNode }) {
  return (
    <header className={styles.sheetHead}>
      <Instrument onObject>{title}</Instrument>
      {no && <Instrument onObject>{no}</Instrument>}
    </header>
  );
}

/**
 * A rubber stamp. `pressed` places it across a sheet and presses it on
 * arrival: a strike, never an overshoot.
 */
export function Stamp({
  pressed = false,
  living = false,
  top,
  children,
}: {
  pressed?: boolean;
  /** Reserved for what is actually alive. */
  living?: boolean;
  /** Vertical placement on the sheet, as a CSS length. */
  top?: string;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLSpanElement>('0px 0px -10% 0px');

  const content = (
    <span
      className={[styles.stamp, living && styles.stampLiving].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );

  if (!pressed) {
    return content;
  }

  return (
    <span
      ref={ref}
      className={[styles.stampPressed, inView && styles.stampPressedActive]
        .filter(Boolean)
        .join(' ')}
      style={top ? ({ '--stamp-top': top } as CSSProperties) : undefined}
      aria-hidden="true"
    >
      {content}
    </span>
  );
}

/** Annotations pasted onto a record. Small, askew, attributed. */
export function Slips({ children }: { children: ReactNode }) {
  return <ul className={styles.slips}>{children}</ul>;
}

export function Slip({ hand, children }: { hand: string; children: ReactNode }) {
  return (
    <li className={styles.slip}>
      <span className={styles.slipHand}>{hand}</span>
      <span className={styles.slipNote}>{children}</span>
    </li>
  );
}

/* ==========================================================================
   Filing run — the interior's answer to the card grid
   ========================================================================== */

export function Drawers({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={[styles.drawers, className].filter(Boolean).join(' ')}>{children}</ul>;
}

type DrawerProps = {
  label: string;
  detail: string;
  Glyph: (props: { className?: string }) => JSX.Element;
  /** Omitted while the destination does not exist; the drawer renders sealed. */
  to?: string;
  /** Accession number. Sequence carries information here: it is a cabinet. */
  no?: string;
  /** What a sealed drawer says instead of opening. */
  state?: string;
};

export function Drawer({ label, detail, Glyph, to, no, state = 'Not yet accessioned' }: DrawerProps) {
  const body = (
    <>
      {no && <span className={styles.drawerNo}>{no}</span>}
      <span className={styles.drawerGlyph} aria-hidden="true">
        <Glyph />
      </span>
      <span className={styles.drawerText}>
        <span className={styles.drawerLabel}>{label}</span>
        <span className={styles.drawerDetail}>{detail}</span>
      </span>
    </>
  );

  if (!to) {
    return (
      <li className={`${styles.drawer} ${styles.drawerSealed}`}>
        {body}
        <span className={styles.drawerState}>{state}</span>
      </li>
    );
  }

  return (
    <li>
      <Link to={to} className={styles.drawer}>
        {body}
        <span className={styles.drawerPull} aria-hidden="true">
          <ArrowGlyph />
        </span>
      </Link>
    </li>
  );
}

/* ==========================================================================
   Figures — readings off the instrument
   ========================================================================== */

export function Figures({
  row = false,
  children,
  className,
}: {
  /** Lay the readings out across the bench rather than down the column. */
  row?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[styles.figures, row && styles.figuresRow, className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

/**
 * One reading. Deliberately not the hero-metric template: the unit is part of
 * the reading rather than a label under it, the note says what the reading
 * MEANS, and a figure without a source is not a figure.
 *
 * The tally starts when the reader can actually watch it, and never restarts.
 */
export function Figure({
  value,
  unit,
  source,
  children,
}: {
  value: string;
  unit?: string;
  source?: string;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const shown = useCountUp(value, inView);

  return (
    <div ref={ref} className={styles.figure}>
      <p className={styles.figureValue} data-figure>
        <span>{shown}</span>
        {unit && <span className={styles.figureUnit}>{unit}</span>}
      </p>
      <p className={styles.figureNote}>{children}</p>
      {source && <p className={styles.figureSource}>{source}</p>}
    </div>
  );
}

/* ==========================================================================
   Action — the island control
   ========================================================================== */

export function Action({
  to,
  href,
  ghost = false,
  submit = false,
  onClick,
  icon,
  children,
}: {
  to?: string;
  href?: string;
  ghost?: boolean;
  /** Submits the form it stands in, so a form's own control is this control. */
  submit?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const className = [styles.action, ghost && styles.actionGhost].filter(Boolean).join(' ');
  /* One element deep. The label and the glyph sit directly in the control —
     there is no inner core and no icon disc, because a control does not need
     to be enclosed inside itself to read as one. */
  const core = (
    <>
      <span className={styles.actionLabel}>{children}</span>
      <span className={styles.actionIcon} aria-hidden="true">
        {icon ?? <ArrowGlyph />}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {core}
      </Link>
    );
  }

  if (href) {
    /* Only an off-site destination opens in a new tab. A jump to a section of
       the page the reader is already on must not, and neither must a mailto —
       both left an empty tab behind when this forced `_blank` on everything. */
    const offsite = href.startsWith('http');
    return (
      <a
        href={href}
        className={className}
        target={offsite ? '_blank' : undefined}
        rel={offsite ? 'noreferrer' : undefined}
      >
        {core}
      </a>
    );
  }

  return (
    <button type={submit ? 'submit' : 'button'} className={className} onClick={onClick}>
      {core}
    </button>
  );
}
