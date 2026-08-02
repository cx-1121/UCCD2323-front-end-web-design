/**
 * Hand-authored hairline icon set. Uniform 24px box, stroke-width 1, round
 * caps, currentColor — deliberately thinner than any off-the-shelf icon pack
 * so the glyphs read as drafting marks rather than UI furniture.
 */
import type { SVGProps } from 'react';

type GlyphProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false',
} as const;

/* ---------- Energy source glyphs ---------- */

function SolarGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1" />
    </svg>
  );
}

function WindGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 12V22" />
      <path d="M9.5 22h5" />
      <path d="M12 12 4 8.6M12 12l8.6-2.4M12 12l-2 8.5" />
      <circle cx="12" cy="12" r="1.4" />
    </svg>
  );
}

function HydroGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 2.5s4.5 5.2 4.5 8.6a4.5 4.5 0 0 1-9 0C7.5 7.7 12 2.5 12 2.5Z" />
      <path d="M2.5 18.2c1.6 0 2.4-1.1 4-1.1s2.4 1.1 4 1.1 2.4-1.1 4-1.1 2.4 1.1 4 1.1" />
      <path d="M2.5 21.4c1.6 0 2.4-1.1 4-1.1s2.4 1.1 4 1.1 2.4-1.1 4-1.1 2.4 1.1 4 1.1" />
    </svg>
  );
}

function BiomassGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.5v-8.7" />
      <path d="M12 12.8c0-4.6 3-8.3 8.5-9-.6 5.9-3.6 9-8.5 9Z" />
      <path d="M11.6 15.6C8.4 15.4 6 13.2 5.2 9.4c3.6.4 5.9 2.3 6.4 5.3Z" />
    </svg>
  );
}

function GeoGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 20.5h19" />
      <path d="M5 20.5 10 12l3.4 5.2L15.6 14l5.9 6.5" />
      <path d="M9 7.8c1.3-.9 1.3-2.2 0-3.1M13 7c1.3-.9 1.3-2.9 0-3.8M17 7.8c1.3-.9 1.3-2.2 0-3.1" />
    </svg>
  );
}

/* ---------- Category glyphs ---------- */

function MechanismGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="2.6" />
      <path d="M12 2.6v6.8M12 14.6v6.8M2.6 12h6.8M14.6 12h6.8" />
      <circle cx="12" cy="12" r="8.4" strokeDasharray="1.5 3.5" />
    </svg>
  );
}

function UpsideGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 17.5 9 11l4 3.6 7.5-8.6" />
      <path d="M15.4 6h5.1v5.1" />
    </svg>
  );
}

function LimitGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v6M12 16.6h.01" />
    </svg>
  );
}

function FieldGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="7.2" height="7.2" rx="1.6" />
      <rect x="13.8" y="3" width="7.2" height="7.2" rx="1.6" />
      <rect x="3" y="13.8" width="7.2" height="7.2" rx="1.6" />
      <path d="M17.4 13.8v7.2M13.8 17.4h7.2" />
    </svg>
  );
}

function CompassGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9Z" />
    </svg>
  );
}

function ReplayGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.2 4.4v4.2h4.2" />
    </svg>
  );
}

function BoltGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.4 2.5 5.2 13.1h5.3l-.7 8.4 8.2-10.6h-5.3l.7-8.4Z" />
    </svg>
  );
}

function LayersGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2 3.4 7.6 12 12l8.6-4.4L12 3.2Z" />
      <path d="M3.4 12.2 12 16.6l8.6-4.4M3.4 16.6 12 21l8.6-4.4" />
    </svg>
  );
}

function TargetGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="0.9" />
    </svg>
  );
}

function HorizonGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 16.5h19" />
      <path d="M6 20.2h12" />
      <path d="M17 16.5a5 5 0 0 0-10 0" />
      <path d="M12 4.2v2.4M5.6 6.9l1.7 1.7M18.4 6.9l-1.7 1.7" />
    </svg>
  );
}

function OrbitGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 12c5.5-3.2 10.4-3.8 11-1.4.6 2.4-3.5 6.9-9 10.1S3.6 24.5 3 22.1c-.4-1.6 1.4-4.2 4.4-6.8" transform="translate(0 -5)" />
    </svg>
  );
}

function ArrowGlyph(props: GlyphProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7" />
      <path d="M8.5 7H17v8.5" />
    </svg>
  );
}

/* Components only — no maps or constants alongside them, so react-refresh can
   hot-replace this module cleanly. Callers build their own lookup tables. */
export {
  SolarGlyph,
  WindGlyph,
  HydroGlyph,
  BiomassGlyph,
  GeoGlyph,
  MechanismGlyph,
  UpsideGlyph,
  LimitGlyph,
  FieldGlyph,
  CompassGlyph,
  ReplayGlyph,
  BoltGlyph,
  LayersGlyph,
  TargetGlyph,
  HorizonGlyph,
  OrbitGlyph,
  ArrowGlyph,
};
