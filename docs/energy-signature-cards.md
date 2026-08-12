# Energy Signature Cards Documentation (Explore Page)

This document provides complete architectural, styling, and location details for the 5 Renewable Energy Signature Cards (Solar, Wind, Hydroelectric, Biomass, Geothermal) rendered on the Explore Page (`/explore`).

---

## 1. Card Overview & Locations

The signature cards serve as visual anchors within each energy section's bento grid layout on the Explore Page. Each card displays a signature vector glyph at the top and the energy source name at the bottom, styled with a double-bezel card enclosure and a subtle top-right radial gradient glow.

### File Locations:
- **TSX Component**: [src/components/EnergySection/EnergySection.tsx](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/components/EnergySection/EnergySection.tsx#L72-L79)
- **CSS Module**: [src/components/EnergySection/EnergySection.module.css](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/components/EnergySection/EnergySection.module.css#L280-L315)
- **Data Source**: [src/data/EnergySources.tsx](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/data/EnergySources.tsx)
- **Vector Glyphs**: [src/components/icons.tsx](file:///d:/01_Workspace_Dev/01_Projects/frontend-clear/frontend_react/src/components/icons.tsx)

---

## 2. List of 5 Energy Cards

| Energy Source | ID | Glyph Component | Display Name | Radial Gradient |
| :--- | :--- | :--- | :--- | :--- |
| **Solar Energy** | `solar` | `<SolarGlyph />` | `Solar` | Top-right Emerald Glow (`rgba(4, 120, 87, 0.12)`) |
| **Wind Energy** | `wind` | `<WindGlyph />` | `Wind` | Top-right Emerald Glow (`rgba(4, 120, 87, 0.12)`) |
| **Hydroelectric Power** | `hydroelectric` | `<HydroGlyph />` | `Hydroelectric` | Top-right Emerald Glow (`rgba(4, 120, 87, 0.12)`) |
| **Biomass Energy** | `biomass` | `<BiomassGlyph />` | `Biomass` | Top-right Emerald Glow (`rgba(4, 120, 87, 0.12)`) |
| **Geothermal Energy** | `geothermal` | `<GeoGlyph />` | `Geothermal` | Top-right Emerald Glow (`rgba(4, 120, 87, 0.12)`) |

---

## 3. Component Structure & TSX Snippet

From `src/components/EnergySection/EnergySection.tsx`:

```tsx
{/* Signature plate — the visual anchor that breaks the text rhythm */}
<div className={`${styles.tile} ${styles.tileSignature}`} data-reveal data-reveal-index="2">
  <span className={styles.signatureGlyph} aria-hidden="true">
    <SourceGlyph />
  </span>
  <span className={styles.signatureName} aria-hidden="true">
    {source.name.split(' ')[0]}
  </span>
</div>
```

---

## 4. Styling & Radial Gradient Details

From `src/components/EnergySection/EnergySection.module.css`:

```css
/* ---- Signature plate ---- */
.tileSignature {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100%;
  overflow: hidden;
  /* Top-right subtle emerald radial gradient glow */
  background:
    radial-gradient(90% 70% at 80% 10%, rgba(4, 120, 87, 0.12), transparent 68%),
    rgba(12, 46, 32, 0.022);
}

.signatureGlyph {
  display: block;
  color: var(--signal); /* Brand emerald: #047857 */
  opacity: 0.9;
}

.signatureGlyph svg {
  width: clamp(2.5rem, 5vw, 3.5rem);
  height: clamp(2.5rem, 5vw, 3.5rem);
  transition: transform 900ms var(--ease-fluid);
}

/* Micro-hover animation: rotate 12deg & scale up 1.04x */
.tileSignature:hover .signatureGlyph svg {
  transform: rotate(12deg) scale(1.04);
}

.signatureName {
  margin-top: 2.25rem;
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  font-weight: 200;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--ink);
}
```

---

## 5. Glyph Mapping Logic

```typescript
const sourceGlyphs = {
  solar: SolarGlyph,
  wind: WindGlyph,
  hydroelectric: HydroGlyph,
  biomass: BiomassGlyph,
  geothermal: GeoGlyph,
} as const;
```
