import { useEffect } from 'react';
import type { RefObject } from 'react';
import { animState } from '../utils/animState';

export function useParticleCanvas(canvasRef: RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMobile = window.innerWidth <= 768;
    let particles: Particle[] = [];
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    let svgChimneyScreenCoords: { x: number; y: number }[] = [];
    let svgCityScale = 1;

    function updateChimneyPositions() {
      const svg = document.querySelector('#industrial-silhouette-container svg') as SVGSVGElement | null;
      if (!svg) return;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      svgCityScale = Math.min(ctm.a, ctm.d);
      const chimneyViewBox = [
        { x: 188, y: 244 },
        { x: 313, y: 210 },
        { x: 815, y: 232 },
      ];
      svgChimneyScreenCoords = chimneyViewBox.map((c) => {
        const pt = svg.createSVGPoint();
        pt.x = c.x;
        pt.y = c.y;
        const s = pt.matrixTransform(ctm);
        return { x: s.x, y: s.y };
      });
    }

    function resizeCanvas() {
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      canvas!.width = canvasWidth;
      canvas!.height = canvasHeight;
      isMobile = window.innerWidth <= 768;
      updateChimneyPositions();
    }

    class Particle {
      x: number;
      y: number;
      type: string;
      size: number;
      alpha: number;
      vx: number;
      vy: number;
      maxLife: number;
      life: number;
      scale?: number;
      color: string;

      constructor(x: number, y: number, type: string) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = Math.random() * 2 + 1;
        this.alpha = 1;
        this.vx = 0;
        this.vy = 0;
        this.maxLife = 100;

        if (type === 'smoke') {
          const spread = animState.smokeSpread || 0;
          this.vx = (Math.random() - 0.5) * 1.2 * (1 + spread * 8);
          this.vy =
            (-Math.random() * 2.2 - 1.2) * (1 - spread * 0.5) +
            (Math.random() - 0.5) * 1.2 * (1 + spread * 8);
          this.color = `rgba(210, 210, 210, ${0.05 + Math.random() * 0.04})`;
          const cityScale = svgCityScale * (1000 / 700);
          this.scale = cityScale;
          this.size = (Math.random() * 18 + 8) * cityScale * (1 + spread * 6.5);
          this.vx *= cityScale;
          const vyScale = canvasHeight > canvasWidth ? Math.max(cityScale, 0.85) : cityScale;
          this.vy *= vyScale;
          const smokeLifeFactor = canvasHeight > canvasWidth ? 2.0 : 1.0;
          this.maxLife =
            (Math.random() * 160 + 120) * (1 + spread * 0.8) * smokeLifeFactor;
        } else {
          // Fallback static smog-particle
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          this.color = 'rgba(100, 110, 120, 0.35)';
          this.size = Math.random() * 4 + 2;
          this.maxLife = 99999;
        }
        this.life = this.maxLife;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.type === 'smoke') {
          const spread = animState.smokeSpread || 0;
          this.size += 0.15 * (this.scale || 1) * (1 + spread * 4);
          this.vx *= 0.985;
          const frictionY = canvasHeight > canvasWidth ? 0.99 : 0.985;
          this.vy *= frictionY;
          this.vy -= 0.02 * (canvasHeight > canvasWidth ? 1.5 : 1) * (this.scale || 1);
          this.life--;
        }
        this.alpha = Math.max(0, this.life / this.maxLife);
      }

      draw() {
        ctx!.save();
        ctx!.globalAlpha = this.alpha;
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }
    }

    const MAX_PARTICLES = 600;
    function spawnParticles(x: number, y: number, type: string, count: number) {
      if (particles.length >= MAX_PARTICLES) return;
      const actualCount = isMobile ? Math.ceil(count * 0.4) : count;
      for (let i = 0; i < actualCount; i++) {
        particles.push(new Particle(x, y, type));
      }
    }

    let animationFrameId: number;

    function animateParticles() {
      ctx!.clearRect(0, 0, canvasWidth, canvasHeight);

      // Spawn smoke
      if (animState.smokeIntensity > 0.1) {
        updateChimneyPositions();
        svgChimneyScreenCoords.forEach((ch) => {
          const spread = animState.smokeSpread || 0;
          let spawnChance = (animState.smokeIntensity * 0.4 + spread * 0.6) * 0.5;
          if (canvasHeight > canvasWidth) spawnChance *= 1.5;
          if (Math.random() < spawnChance) {
            let count = spread > 0.5 && Math.random() > 0.5 ? 2 : 1;
            if (canvasHeight > canvasWidth && Math.random() < 0.4) count += 1;
            spawnParticles(ch.x, ch.y, 'smoke', count);
          }
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          p.draw();
        }
      }

      animationFrameId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animateParticles();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef]);
}
