import { useRef } from 'react';
import { useParticleCanvas } from '../../hooks/useParticleCanvas';
import './ParticleCanvas.module.css';

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useParticleCanvas(canvasRef);

  return <canvas id="particle-canvas" ref={canvasRef} />;
}

export default ParticleCanvas;
