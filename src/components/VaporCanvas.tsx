import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface VaporCanvasRef {
  emitPuff: (originX?: number, originY?: number, intensity?: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  growth: number;
  alpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  colorHue: number;
}

interface VaporCanvasProps {
  enabled?: boolean;
}

export const VaporCanvas = forwardRef<VaporCanvasRef, VaporCanvasProps>(({ enabled = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const emitPuff = (originX?: number, originY?: number, intensity: number = 25) => {
    if (!enabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const x = originX ?? canvas.width / 2;
    const y = originY ?? canvas.height * 0.65;

    const newParticles: Particle[] = [];
    for (let i = 0; i < intensity; i++) {
      const angle = (Math.random() * Math.PI * 1.4) - (Math.PI * 0.7); // upward cone arc
      const speed = Math.random() * 3.5 + 1.2;
      newParticles.push({
        x: x + (Math.random() * 30 - 15),
        y: y + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1) * 0.7,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.5,
        size: Math.random() * 20 + 25,
        growth: Math.random() * 1.2 + 0.8,
        alpha: Math.random() * 0.45 + 0.35,
        decay: Math.random() * 0.008 + 0.005,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        colorHue: Math.random() * 30 + 240, // deep blue/indigo smoke tint
      });
    }
    particlesRef.current.push(...newParticles);
  };

  useImperativeHandle(ref, () => ({
    emitPuff,
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentParticles = particlesRef.current;
      for (let i = currentParticles.length - 1; i >= 0; i--) {
        const p = currentParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.98; // atmospheric drag
        p.vx += (Math.random() - 0.5) * 0.15; // gentle smoke turbulence drift
        p.size += p.growth;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0 || p.y < -100) {
          currentParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        // Soft cloud gradient particle
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, `hsla(${p.colorHue}, 60%, 85%, ${p.alpha})`);
        grad.addColorStop(0.5, `hsla(${p.colorHue}, 40%, 70%, ${p.alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${p.colorHue}, 30%, 50%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-hidden"
    />
  );
});

VaporCanvas.displayName = 'VaporCanvas';
