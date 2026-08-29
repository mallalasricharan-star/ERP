import React, { useEffect, useRef } from 'react';
import { AnimationThemeConfig } from '../../services/themeService';

interface FuturisticVisualizerProps {
  theme: AnimationThemeConfig;
  className?: string;
}

export const FuturisticVisualizer: React.FC<FuturisticVisualizerProps> = ({
  theme,
  className = 'w-full h-full'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 360);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 360);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse Interaction
    let mouseX = width / 2;
    let mouseY = height / 2;
    let isHovered = false;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovered = true;
    };

    const handleMouseLeave = () => {
      isHovered = false;
      mouseX = width / 2;
      mouseY = height / 2;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes pool
    const numParticles = 80;
    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }[] = [];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.4,
        vy: (Math.random() - 0.5) * 1.4,
        size: 1.5 + Math.random() * 2.5
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      const cx = width / 2;
      const cy = height / 2;

      // Dynamic Theme Hue
      const baseHue = theme.particleHue;

      // 1. Core Ambient Glow
      const ambient = ctx.createRadialGradient(cx, cy, 5, cx, cy, 140);
      ambient.addColorStop(0, `hsla(${baseHue}, 90%, 65%, 0.3)`);
      ambient.addColorStop(0.5, `hsla(${baseHue + 20}, 80%, 50%, 0.1)`);
      ambient.addColorStop(1, 'rgba(5, 8, 17, 0)');
      ctx.fillStyle = ambient;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.fill();

      // 2. Quantum / Gyro Multi-Axis Rings
      const numRings = 3;
      for (let r = 0; r < numRings; r++) {
        const radius = 50 + r * 28;
        const tilt = (r * Math.PI) / numRings + time * (r % 2 === 0 ? 0.6 : -0.6);
        const aspect = Math.abs(Math.sin(tilt));

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(time * 0.3 * (r % 2 === 0 ? 1 : -1) + (r * Math.PI) / 3);

        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * (0.35 + aspect * 0.65), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${baseHue + r * 15}, 90%, 65%, 0.6)`;
        ctx.lineWidth = 1.8;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${baseHue}, 100%, 60%, 0.8)`;
        ctx.stroke();

        // Orbiting Photons
        const pAngle = time * (1.2 + r * 0.3);
        const px = Math.cos(pAngle) * radius;
        const py = Math.sin(pAngle) * (radius * (0.35 + aspect * 0.65));

        ctx.beginPath();
        ctx.arc(px, py, 3.5 + r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = theme.primaryColor;
        ctx.fill();

        ctx.restore();
      }

      // 3. Central Illuminated Fusion Heart
      const pulse = Math.sin(time * 3) * 5;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28 + pulse);
      core.addColorStop(0, '#ffffff');
      core.addColorStop(0.35, theme.primaryColor);
      core.addColorStop(0.8, theme.secondaryColor);
      core.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, 28 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.shadowBlur = 25;
      ctx.shadowColor = theme.primaryColor;
      ctx.fill();

      // 4. Connecting Neural Grid Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        if (isHovered) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.x += (dx / dist) * 1.2;
            p.y += (dy / dist) * 1.2;
          }
        }
      });

      // Draw Connection Filaments
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 70) {
            const alpha = (1 - d / 70) * 0.45;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${baseHue}, 90%, 65%, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw particle dots
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${baseHue}, 100%, 75%, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = theme.primaryColor;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full object-contain cursor-crosshair z-0" />
    </div>
  );
};
