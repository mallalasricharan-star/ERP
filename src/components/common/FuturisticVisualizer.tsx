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

    // Particles Pool for different engines
    const numItems = 90;
    const items: {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      size: number;
      angle: number;
      radius: number;
      speed: number;
      history: { x: number; y: number }[];
    }[] = [];

    for (let i = 0; i < numItems; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 1.5 + Math.random() * 2.5,
        angle: Math.random() * Math.PI * 2,
        radius: 30 + Math.random() * 110,
        speed: 0.008 + Math.random() * 0.02,
        history: []
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.025;

      const cx = width / 2;
      const cy = height / 2;
      const baseHue = theme.particleHue;
      const vType = theme.visualType;

      // =========================================================================
      // 1. QUANTUM GYRO ENGINE (Rotating 3D Rings & Nuclear Plasma Heart)
      // =========================================================================
      if (vType === 'quantum-gyro') {
        const bgGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
        bgGlow.addColorStop(0, `hsla(${baseHue}, 90%, 65%, 0.35)`);
        bgGlow.addColorStop(0.6, `hsla(${baseHue + 30}, 80%, 45%, 0.1)`);
        bgGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.fill();

        for (let r = 0; r < 4; r++) {
          const ringRadius = 45 + r * 26;
          const tilt = (r * Math.PI) / 4 + time * (r % 2 === 0 ? 0.7 : -0.7);
          const aspect = Math.abs(Math.sin(tilt));

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(time * 0.35 * (r % 2 === 0 ? 1 : -1) + (r * Math.PI) / 4);

          ctx.beginPath();
          ctx.ellipse(0, 0, ringRadius, ringRadius * (0.35 + aspect * 0.65), 0, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${baseHue + r * 20}, 95%, 65%, 0.65)`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = theme.primaryColor;
          ctx.stroke();

          // Photon Spark
          const pAngle = time * (1.4 + r * 0.4);
          const px = Math.cos(pAngle) * ringRadius;
          const py = Math.sin(pAngle) * (ringRadius * (0.35 + aspect * 0.65));

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 18;
          ctx.shadowColor = theme.primaryColor;
          ctx.fill();

          ctx.restore();
        }

        const pulse = Math.sin(time * 3) * 6;
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + pulse);
        core.addColorStop(0, '#ffffff');
        core.addColorStop(0.4, theme.primaryColor);
        core.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 30 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();
      }

      // =========================================================================
      // 2. NEURAL MESH ENGINE (Connected Constellation Nodes with Mouse Physics)
      // =========================================================================
      else if (vType === 'neural-mesh') {
        items.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x <= 10 || n.x >= width - 10) n.vx *= -1;
          if (n.y <= 10 || n.y >= height - 10) n.vy *= -1;

          if (isHovered) {
            const dx = mouseX - n.x;
            const dy = mouseY - n.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 110) {
              n.x += (dx / dist) * 1.5;
              n.y += (dy / dist) * 1.5;
            }
          }
        });

        for (let i = 0; i < items.length; i++) {
          for (let j = i + 1; j < items.length; j++) {
            const dx = items[i].x - items[j].x;
            const dy = items[i].y - items[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 85) {
              const alpha = (1 - dist / 85) * 0.65;
              ctx.beginPath();
              ctx.moveTo(items[i].x, items[i].y);
              ctx.lineTo(items[j].x, items[j].y);
              ctx.strokeStyle = `hsla(${baseHue}, 90%, 65%, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        items.forEach((n) => {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${baseHue}, 100%, 75%, 0.9)`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = theme.primaryColor;
          ctx.fill();
        });
      }

      // =========================================================================
      // 3. COSMIC ORBIT ENGINE (Concentric Planetary Tracks & Orbiting Moons)
      // =========================================================================
      else if (vType === 'cosmic-orbit') {
        const sunRadius = 28 + Math.sin(time * 2) * 3;
        const sunGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunRadius * 2);
        sunGrad.addColorStop(0, '#ffffff');
        sunGrad.addColorStop(0.3, theme.primaryColor);
        sunGrad.addColorStop(0.8, theme.secondaryColor);
        sunGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(cx, cy, sunRadius * 2, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.fill();

        const planets = [
          { r: 55, speed: 1.1, size: 6, color: '#34d399' },
          { r: 90, speed: 0.7, size: 8, color: theme.primaryColor },
          { r: 125, speed: 0.45, size: 10, color: theme.secondaryColor },
          { r: 155, speed: 0.25, size: 7, color: '#f43f5e' }
        ];

        planets.forEach((p, idx) => {
          ctx.beginPath();
          ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${baseHue}, 80%, 60%, 0.2)`;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);

          const pAngle = time * p.speed + idx * 1.8;
          const px = cx + Math.cos(pAngle) * p.r;
          const py = cy + Math.sin(pAngle) * p.r;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = p.color;
          ctx.fill();

          // Satellite Moon
          const mx = px + Math.cos(time * 3) * (p.size + 8);
          const my = py + Math.sin(time * 3) * (p.size + 8);
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      }

      // =========================================================================
      // 4. WAVEFORM PULSE ENGINE (Oscilloscope Frequency Soundwaves & Radar Rings)
      // =========================================================================
      else if (vType === 'waveform-pulse') {
        const numBars = 48;
        const radius = 60;

        for (let i = 0; i < numBars; i++) {
          const angle = (i * Math.PI * 2) / numBars;
          const waveHeight = Math.sin(angle * 4 + time * 3) * 25 + Math.cos(angle * 2 - time * 2) * 15 + 30;

          const x1 = cx + Math.cos(angle) * radius;
          const y1 = cy + Math.sin(angle) * radius;
          const x2 = cx + Math.cos(angle) * (radius + waveHeight);
          const y2 = cy + Math.sin(angle) * (radius + waveHeight);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(${baseHue + (i * 4)}, 95%, 65%, 0.8)`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.shadowBlur = 10;
          ctx.shadowColor = theme.primaryColor;
          ctx.stroke();
        }

        // Concentric acoustic pulse ripples
        for (let w = 1; w <= 3; w++) {
          const wR = (radius + 20 + ((time * 40 * w) % 90));
          ctx.beginPath();
          ctx.arc(cx, cy, wR, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${baseHue}, 90%, 65%, ${Math.max(0, 1 - wR / 150)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = theme.primaryColor;
        ctx.shadowBlur = 20;
        ctx.shadowColor = theme.primaryColor;
        ctx.fill();
      }

      // =========================================================================
      // 5. CYBER TUNNEL ENGINE (3D Wireframe Cyber Grid & Hexagonal Matrix)
      // =========================================================================
      else if (vType === 'cyber-tunnel') {
        const numHex = 6;
        for (let h = 0; h < numHex; h++) {
          const progress = ((time * 0.4 + h / numHex) % 1);
          const hexR = progress * 150;
          const alpha = Math.sin(progress * Math.PI);

          ctx.beginPath();
          for (let s = 0; s < 6; s++) {
            const hAngle = (s * Math.PI) / 3 + time * 0.2;
            const hx = cx + Math.cos(hAngle) * hexR;
            const hy = cy + Math.sin(hAngle) * hexR;
            if (s === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.strokeStyle = `hsla(${baseHue + h * 20}, 90%, 60%, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = theme.primaryColor;
          ctx.stroke();
        }

        // Center Matrix Portal
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = theme.primaryColor;
        ctx.fill();
      }

      // =========================================================================
      // 6. WARP HYPERSPACE ENGINE (Radial Warp Speed Laser Trails)
      // =========================================================================
      else if (vType === 'warp-hyperspace') {
        items.forEach((p) => {
          p.radius += p.speed * 4;
          if (p.radius > 160) {
            p.radius = 5 + Math.random() * 15;
            p.angle = Math.random() * Math.PI * 2;
          }

          const tailLen = p.radius * 0.35;
          const x1 = cx + Math.cos(p.angle) * p.radius;
          const y1 = cy + Math.sin(p.angle) * p.radius;
          const x2 = cx + Math.cos(p.angle) * (p.radius + tailLen);
          const y2 = cy + Math.sin(p.angle) * (p.radius + tailLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `hsla(${baseHue}, 100%, 75%, ${Math.min(1, p.radius / 80)})`;
          ctx.lineWidth = 1.5 + (p.radius / 60);
          ctx.shadowBlur = 10;
          ctx.shadowColor = theme.primaryColor;
          ctx.stroke();
        });

        // Hyper-drive flare
        const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
        flare.addColorStop(0, '#ffffff');
        flare.addColorStop(0.5, theme.primaryColor);
        flare.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = flare;
        ctx.fill();
      }

      // =========================================================================
      // 7. POLYGON CRYSTAL ENGINE (3D Rotating Wireframe Polyhedron & Radar Sweep)
      // =========================================================================
      else if (vType === 'polygon-crystal') {
        const numVerts = 8;
        const polyRadius = 80 + Math.sin(time) * 8;
        const verts: { x: number; y: number }[] = [];

        for (let v = 0; v < numVerts; v++) {
          const vAngle = (v * Math.PI * 2) / numVerts + time * 0.5;
          const vx = cx + Math.cos(vAngle) * polyRadius;
          const vy = cy + Math.sin(vAngle) * (polyRadius * 0.7);
          verts.push({ x: vx, y: vy });

          ctx.beginPath();
          ctx.arc(vx, vy, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = theme.primaryColor;
          ctx.fill();
        }

        // Draw Crystalline Edge Lattice
        for (let i = 0; i < verts.length; i++) {
          for (let j = i + 1; j < verts.length; j++) {
            ctx.beginPath();
            ctx.moveTo(verts[i].x, verts[i].y);
            ctx.lineTo(verts[j].x, verts[j].y);
            ctx.strokeStyle = `hsla(${baseHue}, 85%, 65%, 0.35)`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Rotating Telemetry Radar Line
        const sweepAngle = time * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * 140, cy + Math.sin(sweepAngle) * 140);
        ctx.strokeStyle = `hsla(${baseHue}, 100%, 75%, 0.8)`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = theme.primaryColor;
        ctx.stroke();
      }

      // =========================================================================
      // 8. PLASMA VORTEX ENGINE (Dual-Spiral Chromatic Fluid Vortex Arms)
      // =========================================================================
      else {
        const numArms = 3;
        const pointsPerArm = 36;

        for (let arm = 0; arm < numArms; arm++) {
          const armOffset = (arm * Math.PI * 2) / numArms;

          for (let p = 0; p < pointsPerArm; p++) {
            const progress = p / pointsPerArm;
            const r = progress * 140;
            const theta = r * 0.08 + time * 1.5 + armOffset;

            const px = cx + Math.cos(theta) * r;
            const py = cy + Math.sin(theta) * r;
            const size = (1 - progress * 0.4) * 3.5;

            ctx.beginPath();
            ctx.arc(px, py, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${baseHue + p * 4}, 100%, 70%, ${0.2 + progress * 0.8})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = theme.primaryColor;
            ctx.fill();
          }
        }

        // Center Vortex Core
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
        core.addColorStop(0, '#ffffff');
        core.addColorStop(0.5, theme.primaryColor);
        core.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.fillStyle = core;
        ctx.fill();
      }

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
