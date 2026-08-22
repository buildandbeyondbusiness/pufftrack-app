import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

export interface VaporCanvasRef {
  emitPuff: (originX?: number, originY?: number, intensity?: number) => void;
}

type ParticleType = 'core' | 'wisp' | 'spark' | 'ring';

interface Particle {
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  targetSize: number;
  growth: number;
  alpha: number;
  maxAlpha: number;
  decay: number;
  rotation: number;
  rotSpeed: number;
  curlFreq: number;
  curlAmp: number;
  life: number;
  hue: number;
  blur: number;
}

interface VaporCanvasProps {
  enabled?: boolean;
}

export const VaporCanvas = forwardRef<VaporCanvasRef, VaporCanvasProps>(({ enabled = true }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  const emitPuff = (originX?: number, originY?: number, intensity: number = 32) => {
    if (!enabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const x = originX ?? canvas.width / 2;
    const y = originY ?? canvas.height * 0.62;

    const newParticles: Particle[] = [];

    // 1. Shockwave Expansion Aura Ring
    newParticles.push({
      type: 'ring',
      x,
      y,
      vx: 0,
      vy: -0.4,
      size: 15,
      targetSize: 180,
      growth: 6.5,
      alpha: 0.6,
      maxAlpha: 0.6,
      decay: 0.022,
      rotation: 0,
      rotSpeed: 0,
      curlFreq: 0,
      curlAmp: 0,
      life: 0,
      hue: 205, // Apple electric blue
      blur: 8,
    });

    // 2. Dense Volumetric Core Plumes
    const coreCount = Math.round(intensity * 0.55);
    for (let i = 0; i < coreCount; i++) {
      const angle = (Math.random() * Math.PI * 0.9) - (Math.PI * 0.45); // focused upward column
      const speed = Math.random() * 3.2 + 1.8;
      const initialSize = Math.random() * 18 + 20;

      newParticles.push({
        type: 'core',
        x: x + (Math.random() * 24 - 12),
        y: y + (Math.random() * 16 - 8),
        vx: Math.sin(angle) * speed * 0.75,
        vy: -Math.cos(angle) * speed - 1.8,
        size: initialSize,
        targetSize: initialSize * (Math.random() * 2.8 + 2.2),
        growth: Math.random() * 1.4 + 1.0,
        alpha: 0.05,
        maxAlpha: Math.random() * 0.35 + 0.35,
        decay: Math.random() * 0.007 + 0.005,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        curlFreq: Math.random() * 0.04 + 0.02,
        curlAmp: Math.random() * 0.6 + 0.3,
        life: 0,
        hue: Math.random() * 25 + 195, // ethereal cyan-blue
        blur: Math.random() * 6 + 4,
      });
    }

    // 3. Rolling Vapor Wisps (Curling Tendrils)
    const wispCount = Math.round(intensity * 0.35);
    for (let i = 0; i < wispCount; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const spreadSpeed = Math.random() * 2.5 + 1.0;

      newParticles.push({
        type: 'wisp',
        x: x + side * (Math.random() * 15 + 5),
        y: y - Math.random() * 20,
        vx: side * spreadSpeed * 0.9,
        vy: -(Math.random() * 2.2 + 2.0),
        size: Math.random() * 14 + 16,
        targetSize: Math.random() * 45 + 35,
        growth: Math.random() * 1.1 + 0.7,
        alpha: 0.05,
        maxAlpha: Math.random() * 0.28 + 0.2,
        decay: Math.random() * 0.009 + 0.006,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: side * (Math.random() * 0.035 + 0.015),
        curlFreq: Math.random() * 0.05 + 0.03,
        curlAmp: Math.random() * 1.2 + 0.6,
        life: 0,
        hue: Math.random() * 30 + 210, // indigo-violet wisps
        blur: 4,
      });
    }

    // 4. Floating Luminescent Condensation Micro-Specks
    const sparkCount = Math.round(intensity * 0.3);
    for (let i = 0; i < sparkCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 0.8;

      newParticles.push({
        type: 'spark',
        x: x + Math.cos(angle) * 12,
        y: y + Math.sin(angle) * 12,
        vx: Math.cos(angle) * speed * 0.6,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.2,
        size: Math.random() * 2.2 + 1.2,
        targetSize: Math.random() * 3 + 1.5,
        growth: 0.02,
        alpha: 0.9,
        maxAlpha: 0.9,
        decay: Math.random() * 0.012 + 0.008,
        rotation: 0,
        rotSpeed: 0,
        curlFreq: 0.04,
        curlAmp: 0.4,
        life: 0,
        hue: 190 + Math.random() * 30, // bright diamond cyan
        blur: 2,
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
      timeRef.current += 1;
      const t = timeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentParticles = particlesRef.current;
      for (let i = currentParticles.length - 1; i >= 0; i--) {
        const p = currentParticles[i];
        p.life += 1;

        // Shockwave Ring Rendering
        if (p.type === 'ring') {
          p.size += p.growth;
          p.growth *= 0.94;
          p.alpha -= p.decay;
          p.y += p.vy;

          if (p.alpha <= 0) {
            currentParticles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha * 0.75})`;
          ctx.lineWidth = Math.max(1, 12 * (1 - p.size / p.targetSize));
          ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
          ctx.shadowBlur = 16;
          ctx.stroke();
          ctx.restore();
          continue;
        }

        // Physical Dynamics & Vortex Curl
        const curlOffset = Math.sin(t * p.curlFreq + p.x * 0.05) * p.curlAmp;
        p.x += p.vx + curlOffset;
        p.y += p.vy;

        // Atmospheric deceleration & drag
        p.vy *= 0.982;
        p.vx *= 0.975;
        p.vy -= 0.035; // gentle thermal buoyancy upwards

        // Smooth size expansion
        if (p.size < p.targetSize) {
          p.size += p.growth;
          p.growth *= 0.96;
        }

        // Smooth In/Out alpha curve
        if (p.life < 8 && p.alpha < p.maxAlpha) {
          p.alpha += (p.maxAlpha - p.alpha) * 0.35;
        } else {
          p.alpha -= p.decay;
        }

        p.rotation += p.rotSpeed;

        if (p.alpha <= 0.005 || p.y < -120) {
          currentParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === 'spark') {
          // Sharp Luminescent Condensation Spark
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 95%, 90%, ${p.alpha})`;
          ctx.shadowColor = `hsla(${p.hue}, 100%, 75%, ${p.alpha})`;
          ctx.shadowBlur = 8;
          ctx.fill();
        } else {
          // Volumetric Smoke Puff with Gradient Layers
          ctx.rotate(p.rotation);

          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          // Inner core illumination
          grad.addColorStop(0, `hsla(${p.hue}, 75%, 92%, ${p.alpha * 0.9})`);
          // Mid body
          grad.addColorStop(0.45, `hsla(${p.hue + 10}, 65%, 80%, ${p.alpha * 0.5})`);
          // Outer feather
          grad.addColorStop(0.8, `hsla(${p.hue + 20}, 50%, 65%, ${p.alpha * 0.15})`);
          grad.addColorStop(1, `hsla(${p.hue}, 40%, 50%, 0)`);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

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
      className="pointer-events-none fixed inset-0 z-30 h-full w-full overflow-hidden"
    />
  );
});

VaporCanvas.displayName = 'VaporCanvas';
