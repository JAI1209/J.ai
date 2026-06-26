// src/components/AnimatedBG.jsx
import { useEffect, useRef } from "react";

// ============================================================
// J.ai — INSANE Background System
// A multi-layered particle universe with:
// • 3D parallax particle fields
// • Neural network-like connections
// • Gravitational wave distortions
// • Chromatic aberration effects
// • Interactive mouse influence
// ============================================================

const CONFIG = {
  particleCount: 800,
  connectionDistance: 120,
  waveSpeed: 0.0008,
  mouseInfluence: 0.05,
  colorShift: 0.0002,
};

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// ============================================================
// PARTICLE SYSTEM
// ============================================================
class Particle {
  constructor(w, h, depth) {
    this.reset(w, h);
    this.depth = depth || rand(0.3, 1);
    this.z = rand(0, 1);
    this.size = rand(1.5, 4) * this.depth;
    this.phase = rand(0, Math.PI * 2);
    this.speed = rand(0.2, 0.8) * this.depth;
    this.orbitRadius = rand(20, 150) * this.depth;
    this.orbitSpeed = rand(0.0003, 0.001) * this.depth;
    this.pulseSpeed = rand(0.01, 0.03);
    this.hueOffset = rand(0, 1);
    this.opacity = rand(0.3, 0.9) * this.depth;
  }

  reset(w, h) {
    this.x = rand(0, w);
    this.y = rand(0, h);
    this.vx = rand(-0.3, 0.3);
    this.vy = rand(-0.3, 0.3);
    this.targetX = rand(0, w);
    this.targetY = rand(0, h);
  }

  update(w, h, time, mouseX, mouseY) {
    // Wave distortion
    const waveX = Math.sin(time * CONFIG.waveSpeed + this.phase + this.y * 0.01) * 1.5;
    const waveY = Math.cos(time * CONFIG.waveSpeed * 0.7 + this.phase * 1.3 + this.x * 0.01) * 1.5;

    // Orbital motion
    const orbitAngle = time * this.orbitSpeed + this.phase;
    const orbitX = Math.cos(orbitAngle) * this.orbitRadius * 0.5;
    const orbitY = Math.sin(orbitAngle * 0.7) * this.orbitRadius * 0.3;

    // Mouse influence
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const distToMouse = Math.hypot(dx, dy) || 1;
    const mouseForce = Math.max(0, 1 - distToMouse / 300) * CONFIG.mouseInfluence;

    // Smooth target following
    this.x += (this.targetX - this.x) * 0.0005 + waveX * 0.02 + orbitX * 0.01 + dx * mouseForce * 0.01;
    this.y += (this.targetY - this.y) * 0.0005 + waveY * 0.02 + orbitY * 0.01 + dy * mouseForce * 0.01;

    // Gentle random movement
    this.x += Math.sin(time * 0.0003 + this.phase) * 0.1;
    this.y += Math.cos(time * 0.0004 + this.phase * 0.7) * 0.1;

    // Wrap around edges with padding
    const pad = 50;
    if (this.x < -pad) this.x = w + pad;
    if (this.x > w + pad) this.x = -pad;
    if (this.y < -pad) this.y = h + pad;
    if (this.y > h + pad) this.y = -pad;

    // Update target occasionally for organic movement
    if (Math.random() < 0.0005) {
      this.targetX = rand(0, w);
      this.targetY = rand(0, h);
    }

    this.hueOffset += CONFIG.colorShift;
    if (this.hueOffset > 1) this.hueOffset -= 1;
  }

  getColor() {
    const baseHue = 220 + Math.sin(this.hueOffset * Math.PI * 2) * 40;
    const saturation = 50 + Math.sin(this.hueOffset * Math.PI * 2 + 1) * 20;
    const lightness = 60 + Math.sin(this.hueOffset * Math.PI * 2 + 2) * 15;
    return { hue: baseHue, saturation, lightness };
  }

  draw(ctx) {
    const { hue, saturation, lightness } = this.getColor();
    const size = this.size * (1 + Math.sin(this.phase + performance.now() * this.pulseSpeed) * 0.2);
    
    // Glow
    const glow = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, size * 3
    );
    glow.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${this.opacity * 0.8})`);
    glow.addColorStop(0.5, `hsla(${hue + 20}, ${saturation}%, ${lightness}%, ${this.opacity * 0.3})`);
    glow.addColorStop(1, `hsla(${hue + 40}, ${saturation}%, ${lightness}%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.shadowColor = `hsla(${hue}, 80%, 70%, 0.5)`;
    ctx.shadowBlur = size * 2;
    ctx.fillStyle = `hsla(${hue}, ${saturation + 20}%, ${lightness + 10}%, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner sparkle
    if (this.depth > 0.7 && this.size > 2) {
      ctx.fillStyle = `hsla(0, 0%, 100%, ${this.opacity * 0.3})`;
      ctx.beginPath();
      ctx.arc(this.x - size * 0.3, this.y - size * 0.3, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export const AnimatedBG = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let particles = [];
    let time = 0;

    // Mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Resize handler
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      // Recreate particles for new dimensions
      particles = Array.from(
        { length: CONFIG.particleCount },
        () => new Particle(w, h, rand(0.3, 1))
      );
    };
    window.addEventListener("resize", onResize);

    // Create initial particles
    particles = Array.from(
      { length: CONFIG.particleCount },
      () => new Particle(w, h, rand(0.3, 1))
    );

    // Connection cache for performance
    const connections = [];

    // ============================================================
    // DRAW FUNCTIONS
    // ============================================================

    const drawConnections = () => {
      // Only calculate connections every few frames for performance
      if (Math.floor(time * 10) % 3 !== 0) return;

      const maxDist = CONFIG.connectionDistance;
      const maxDistSq = maxDist * maxDist;

      // Clear previous connections
      connections.length = 0;

      // Sample a subset for performance
      const step = particles.length > 500 ? 2 : 1;
      
      for (let i = 0; i < particles.length - 1; i += step) {
        const p1 = particles[i];
        if (!p1 || p1.depth < 0.4) continue;
        
        for (let j = i + 1; j < particles.length; j += step) {
          const p2 = particles[j];
          if (!p2 || p2.depth < 0.4) continue;
          
          const d = dist(p1.x, p1.y, p2.x, p2.y);
          if (d < maxDist) {
            connections.push({
              x1: p1.x,
              y1: p1.y,
              x2: p2.x,
              y2: p2.y,
              distance: d,
              depth: (p1.depth + p2.depth) / 2,
              hue1: p1.getColor().hue,
              hue2: p2.getColor().hue,
            });
          }
        }
      }
    };

    const drawConnectionsCanvas = () => {
      connections.forEach((c) => {
        const alpha = (1 - c.distance / CONFIG.connectionDistance) * 0.15 * c.depth;
        const hue = lerp(c.hue1, c.hue2, 0.5);
        
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        
        const gradient = ctx.createLinearGradient(c.x1, c.y1, c.x2, c.y2);
        gradient.addColorStop(0, `hsla(${c.hue1}, 60%, 60%, ${alpha})`);
        gradient.addColorStop(0.5, `hsla(${hue}, 70%, 65%, ${alpha * 1.2})`);
        gradient.addColorStop(1, `hsla(${c.hue2}, 60%, 60%, ${alpha})`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.5 + (1 - c.distance / CONFIG.connectionDistance) * 0.5;
        ctx.stroke();
      });
    };

    const drawSpiralBackground = () => {
      // Subtle spiral galaxy effect
      const centerX = w / 2;
      const centerY = h / 2;
      const maxRadius = Math.min(w, h) * 0.6;

      for (let i = 0; i < 3; i++) {
        const angleOffset = i * 2.094; // 120 degrees apart
        const spiralAngle = time * 0.00005;
        
        ctx.beginPath();
        for (let r = 0; r < maxRadius; r += 2) {
          const angle = r * 0.008 + spiralAngle + angleOffset;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          
          if (r === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        const alpha = 0.02 + Math.sin(time * 0.0001 + i) * 0.01;
        ctx.strokeStyle = `hsla(240, 50%, 60%, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    const drawGravitationalWaves = () => {
      // Animated wave rings
      const centerX = w / 2 + Math.sin(time * 0.0002) * 100;
      const centerY = h / 2 + Math.cos(time * 0.0003) * 100;
      const waveCount = 3;

      for (let i = 0; i < waveCount; i++) {
        const radius = 100 + i * 80 + Math.sin(time * 0.0004 + i * 0.5) * 30;
        const alpha = 0.03 + i * 0.01;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(220, 60%, 70%, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    const drawMouseRipple = (mouseX, mouseY) => {
      if (mouseX < 0 || mouseY < 0) return;
      
      const radius = 40 + Math.sin(time * 0.005) * 10;
      const gradient = ctx.createRadialGradient(
        mouseX, mouseY, 0,
        mouseX, mouseY, radius
      );
      gradient.addColorStop(0, `hsla(220, 80%, 70%, 0.05)`);
      gradient.addColorStop(1, `hsla(220, 80%, 70%, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer ripple ring
      const ringRadius = 60 + Math.sin(time * 0.003) * 15;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(220, 80%, 70%, ${0.05 + Math.sin(time * 0.003) * 0.02})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    // ============================================================
    // MAIN LOOP
    // ============================================================

    let raf;
    let lastTime = 0;

    const loop = (timestamp) => {
      const dt = Math.min(32, timestamp - lastTime);
      lastTime = timestamp;
      time = timestamp;

      // Clear with slight fade for trail effect
      ctx.clearRect(0, 0, w, h);
      
      // Draw background layers
      drawSpiralBackground();
      drawGravitationalWaves();

      // Update and draw particles
      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;
      
      particles.forEach((p) => {
        p.update(w, h, timestamp, mouseX, mouseY);
        p.draw(ctx);
      });

      // Draw connections between particles
      if (particles.length < 600) {
        drawConnections();
        drawConnectionsCanvas();
      }

      // Mouse interaction effects
      drawMouseRipple(mouseX, mouseY);

      // Chromatic aberration edge glow
      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, 0,
        w / 2, h / 2, Math.max(w, h) * 0.7
      );
      gradient.addColorStop(0, "rgba(94, 92, 230, 0.02)");
      gradient.addColorStop(0.5, "rgba(94, 92, 230, 0.01)");
      gradient.addColorStop(1, "rgba(94, 92, 230, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Vignette effect
      const vignette = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.3,
        w / 2, h / 2, Math.max(w, h) * 0.9
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.04)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(loop);
    };

    // Handle reduced motion
    if (prefersReduced) {
      // Draw static frame
      particles.forEach((p) => p.draw(ctx));
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="facet-bg">
      <canvas ref={canvasRef} className="facet-canvas" />
      <div className="facet-vignette" />
    </div>
  );
};

export default AnimatedBG;