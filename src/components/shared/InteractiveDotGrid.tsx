import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  baseRadius: number;
  baseAlpha: number;
}

export function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const dotsRef = useRef<Dot[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spacing = 40;
    const interactRadius = 120;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);

      // Rebuild dots
      const dots: Dot[] = [];
      const cols = Math.ceil(canvas.offsetWidth / spacing) + 1;
      const rows = Math.ceil(canvas.offsetHeight / spacing) + 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * spacing,
            y: r * spacing,
            baseRadius: 1.2,
            baseAlpha: 0.08,
          });
        }
      }
      dotsRef.current = dots;
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const isDark = () => document.documentElement.classList.contains('dark');

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const dark = isDark();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const dot of dotsRef.current) {
        const dx = dot.x - mx;
        const dy = dot.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / interactRadius);

        const radius = dot.baseRadius + influence * 3;
        const alpha = dot.baseAlpha + influence * 0.35;

        // Slight push away
        const pushX = influence * dx * 0.08;
        const pushY = influence * dy * 0.08;

        const color = dark
          ? `hsla(220, 76%, 60%, ${alpha})`
          : `hsla(220, 76%, 48%, ${alpha})`;

        ctx.beginPath();
        ctx.arc(dot.x + pushX, dot.y + pushY, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw connection lines between nearby influenced dots
        if (influence > 0.1) {
          for (const other of dotsRef.current) {
            const odx = other.x - mx;
            const ody = other.y - my;
            const oDist = Math.sqrt(odx * odx + ody * ody);
            const oInfluence = Math.max(0, 1 - oDist / interactRadius);
            if (oInfluence > 0.1 && other !== dot) {
              const ddx = dot.x - other.x;
              const ddy = dot.y - other.y;
              const dDist = Math.sqrt(ddx * ddx + ddy * ddy);
              if (dDist < spacing * 1.5) {
                const lineAlpha = Math.min(influence, oInfluence) * 0.15;
                ctx.beginPath();
                ctx.moveTo(dot.x + pushX, dot.y + pushY);
                const oPushX = oInfluence * odx * 0.08;
                const oPushY = oInfluence * ody * 0.08;
                ctx.lineTo(other.x + oPushX, other.y + oPushY);
                ctx.strokeStyle = dark
                  ? `hsla(220, 76%, 60%, ${lineAlpha})`
                  : `hsla(220, 76%, 48%, ${lineAlpha})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto -z-10"
      style={{ opacity: 1 }}
    />
  );
}
