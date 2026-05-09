import { forwardRef, useImperativeHandle, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  colors?: string[];
}

export interface ConfettiRef {
  fire: (options?: ConfettiOptions) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  w: number;
  h: number;
  shape: "rect" | "circle";
  opacity: number;
  decay: number;
  gravity: number;
}

export interface ConfettiProps {
  className?: string;
}

// ── Default colours ──────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  "#22d3ee", // cyan-400
  "#38bdf8", // sky-400
  "#818cf8", // indigo-400
  "#a78bfa", // violet-400
  "#f472b6", // pink-400
  "#34d399", // emerald-400
  "#fbbf24", // amber-400
  "#f87171", // red-400
  "#60a5fa", // blue-400
  "#4ade80", // green-400
];

// ── Component ─────────────────────────────────────────────────────────────────

export const Confetti = forwardRef<ConfettiRef, ConfettiProps>(
  ({ className }, ref) => {
    const canvasRef  = useRef<HTMLCanvasElement>(null);
    const rafRef     = useRef<number | null>(null);
    const particles  = useRef<Particle[]>([]);

    function spawnParticles(opts: ConfettiOptions) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const {
        particleCount  = 160,
        spread         = 80,
        startVelocity  = 32,
        decay          = 0.93,
        gravity        = 1,
        colors         = DEFAULT_COLORS,
      } = opts;

      const cw = canvas.width;

      for (let i = 0; i < particleCount; i++) {
        // Spread angle in radians, centred on straight-up (−π/2)
        const angleRad =
          (-Math.PI / 2) + ((Math.random() * spread * 2 - spread) * Math.PI) / 180;
        const speed = startVelocity * (0.6 + Math.random() * 0.4);

        const size = 7 + Math.random() * 6;

        particles.current.push({
          // Spawn across the top of the viewport with a slight random horizontal offset
          x: cw * 0.1 + Math.random() * cw * 0.8,
          y: -12,
          vx: Math.cos(angleRad) * speed,
          vy: Math.sin(angleRad) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 8,
          w: size,
          h: size * (0.4 + Math.random() * 0.3),
          shape: Math.random() > 0.45 ? "rect" : "circle",
          opacity: 1,
          decay,
          gravity,
        });
      }
    }

    function loop() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter((p) => p.opacity > 0.02);

      for (const p of particles.current) {
        // Physics
        p.vy    += p.gravity * 0.28;
        p.vx    *= p.decay;
        p.vy    *= p.decay;
        p.x     += p.vx;
        p.y     += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity  -= 0.007;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle   = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      }

      if (particles.current.length > 0) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    const fire = (opts: ConfettiOptions = {}) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Size canvas to full viewport
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      spawnParticles(opts);

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    useImperativeHandle(ref, () => ({ fire }));

    return <canvas ref={canvasRef} className={className} />;
  }
);

Confetti.displayName = "Confetti";
