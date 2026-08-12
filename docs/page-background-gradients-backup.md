# Non-Landing & Home Page Background Gradients Backup & Guide

This document backs up all background gradients, ambient glows, orbs, atmospheres, sunlight, and flare layers used on HomePage and non-landing pages before their removal.

---

## 1. HomePage (`/home`)

### Description
Fixed atmosphere layer (`.dawn`) containing smoke haze, sunlight radial bloom, horizontal lens flare, and rising emerald/lime bloom (`.bloom`).

### CSS Snippet (`src/pages/HomePage/HomePage.module.css`)
```css
.dawn {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.haze {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 38vh;
  background: linear-gradient(
    180deg,
    rgba(70, 84, 78, 0.1) 0%,
    rgba(70, 84, 78, 0.035) 38%,
    transparent 100%
  );
}

.sunlight {
  position: absolute;
  top: -32vh;
  left: 62%;
  width: min(120vw, 76rem);
  height: 92vh;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 246, 224, 0.95) 0%,
    rgba(255, 233, 183, 0.5) 26%,
    rgba(255, 224, 168, 0.16) 48%,
    transparent 70%
  );
  filter: blur(50px);
}

.flare {
  position: absolute;
  top: 16vh;
  left: 50%;
  width: 150vw;
  height: 16vh;
  margin-left: -75vw;
  transform: translateY(-50%) rotate(-4deg);
  background: linear-gradient(
    90deg,
    rgba(255, 240, 205, 0) 0%,
    rgba(255, 243, 214, 0.22) 40%,
    rgba(255, 250, 235, 0.4) 52%,
    rgba(255, 243, 214, 0.2) 64%,
    rgba(255, 240, 205, 0) 100%
  );
  filter: blur(30px);
}

.bloom {
  position: absolute;
  bottom: -34vh;
  left: 50%;
  width: min(140vw, 90rem);
  height: 80vh;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.15) 0%,
    rgba(132, 204, 22, 0.07) 42%,
    transparent 70%
  );
  filter: blur(90px);
  animation: hpBreathe 22s var(--ease-fluid) infinite alternate;
  will-change: transform;
}
```

### TSX Snippet (`src/pages/HomePage/HomePage.tsx`)
```tsx
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.haze} />
        <span className={styles.sunlight} />
        <span className={styles.flare} />
        <span className={styles.bloom} />
      </div>
```

---

## 2. ExplorePage (`/explore`)

### Description
3 floating radial gradient orbs (`.orb`) inside a fixed mesh container (`.mesh`), with floating drift animation (`exDrift`).

### CSS Snippet (`src/pages/ExplorePage/ExplorePage.module.css`)
```css
.mesh {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.orb {
  position: absolute;
  display: block;
  border-radius: 50%;
  filter: blur(120px);
  will-change: transform;
}

.orbEmerald {
  top: -18vh;
  left: -8vw;
  width: 52vw;
  height: 52vw;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 68%);
  animation: exDrift 26s var(--ease-fluid) infinite alternate;
}

.orbTeal {
  top: 34vh;
  right: -14vw;
  width: 46vw;
  height: 46vw;
  background: radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 68%);
  animation: exDrift 34s var(--ease-fluid) infinite alternate-reverse;
}

.orbLime {
  bottom: -22vh;
  left: 26vw;
  width: 44vw;
  height: 44vw;
  background: radial-gradient(circle, rgba(132, 204, 22, 0.1) 0%, transparent 68%);
  animation: exDrift 30s var(--ease-glide) infinite alternate;
}
```

### TSX Snippet (`src/pages/ExplorePage/ExplorePage.tsx`)
```tsx
      <div className={styles.mesh} aria-hidden="true">
        <span className={`${styles.orb} ${styles.orbEmerald}`} />
        <span className={`${styles.orb} ${styles.orbTeal}`} />
        <span className={`${styles.orb} ${styles.orbLime}`} />
      </div>
```

---

## 3. ProjectsPage (`/projects`)

### Description
Double radial gradient bloom overlay on page intro curtain.

### CSS Snippet (`src/pages/ProjectsPage/ProjectsPage.module.css`)
```css
.curtainBloom {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(60% 55% at 22% 18%, rgba(4, 120, 87, 0.11) 0%, rgba(4, 120, 87, 0) 62%),
    radial-gradient(50% 50% at 82% 82%, rgba(15, 118, 110, 0.09) 0%, rgba(15, 118, 110, 0) 60%);
}
```

---

## 4. QuizChallenge (`/quiz-challenge`)

### Description
Fixed position background ambient bloom.

### CSS Snippet (`src/pages/QuizChallenge/QuizChallenge.module.css`)
```css
.ambientGlow {
  position: fixed;
  top: -15vh;
  right: -10vw;
  width: min(45rem, 80vw);
  height: min(45rem, 80vw);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.12) 0%,
    rgba(4, 120, 87, 0.04) 50%,
    transparent 70%
  );
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
```

---

## 5. AboutPage (`/about`)

### Description
Fixed position breathing dawn bloom layer.

### CSS Snippet (`src/pages/AboutPage/AboutPage.module.css`)
```css
.dawn {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bloom {
  position: absolute;
  top: -30vh;
  left: 58%;
  width: min(130vw, 82rem);
  height: 90vh;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.12) 0%,
    rgba(132, 204, 22, 0.06) 44%,
    transparent 70%
  );
  filter: blur(80px);
  animation: abBreathe 26s var(--ease-fluid) infinite alternate;
  will-change: transform;
}
```

### TSX Snippet (`src/pages/AboutPage/AboutPage.tsx`)
```tsx
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.bloom} />
      </div>
```

---

## 6. ContactPage (`/contact`)

### Description
Fixed position breathing dawn bloom layer.

### CSS Snippet (`src/pages/ContactPage/ContactPage.module.css`)
```css
.dawn {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bloom {
  position: absolute;
  top: -30vh;
  left: 58%;
  width: min(130vw, 82rem);
  height: 90vh;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.12) 0%,
    rgba(132, 204, 22, 0.06) 44%,
    transparent 70%
  );
  filter: blur(80px);
  animation: ctBreathe 26s var(--ease-fluid) infinite alternate;
  will-change: transform;
}
```

### TSX Snippet (`src/pages/ContactPage/ContactPage.tsx`)
```tsx
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.bloom} />
      </div>
```

---

## 7. DashboardPage (`/dashboard`)

### Description
Fixed position breathing dawn bloom layer.

### CSS Snippet (`src/pages/DashboardPage/DashboardPage.module.css`)
```css
.dawn {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bloom {
  position: absolute;
  top: -30vh;
  left: 58%;
  width: min(130vw, 82rem);
  height: 90vh;
  transform: translateX(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.12) 0%,
    rgba(132, 204, 22, 0.06) 44%,
    transparent 70%
  );
  filter: blur(80px);
  animation: dbBreathe 26s var(--ease-fluid) infinite alternate;
  will-change: transform;
}
```

### TSX Snippet (`src/pages/DashboardPage/DashboardPage.tsx`)
```tsx
      <div className={styles.dawn} aria-hidden="true">
        <span className={styles.bloom} />
      </div>
```
