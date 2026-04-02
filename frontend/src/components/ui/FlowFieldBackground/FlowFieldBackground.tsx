"use client";
/** Flow field particle background with mouse interaction. */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { FlowFieldBackgroundProps } from "./FlowFieldBackground.types";

export function FlowFieldBackground({
  className,
  color = "#6366f1",
  trailOpacity = 0.15,
  particleCount = 600,
  speed = 1,
  backgroundColor,
  reducedMotion = false,
}: FlowFieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- CONFIGURATION ---
    let width = container.clientWidth;
    let height = container.clientHeight;
    let particles: Particle[] = [];
    let animationFrameId: number;
    const mouse = { x: -1000, y: -1000 }; // Start off-screen

    // --- PARTICLE CLASS ---
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      age: number;
      life: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      update() {
        const angle =
          (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;

        this.vx += Math.cos(angle) * 0.2 * speed;
        this.vy += Math.sin(angle) * 0.2 * speed;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const interactionRadius = 150;

        if (distance < interactionRadius) {
          const force = (interactionRadius - distance) / interactionRadius;
          this.vx -= dx * force * 0.05;
          this.vy -= dy * force * 0.05;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;

        this.age++;
        if (this.age > this.life) {
          this.reset();
        }

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.life = Math.random() * 200 + 100;
      }

      draw(context: CanvasRenderingContext2D, resolvedColor: string) {
        const alpha = 1 - Math.abs(this.age / this.life - 0.5) * 2;
        context.globalAlpha = alpha;
        context.fillStyle = resolvedColor;
        context.fillRect(this.x, this.y, 1.5, 1.5);
      }
    }

    // --- INITIALIZATION ---
    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    // Resolve a CSS variable like "var(--primary)" to its actual hex/rgb value
    const resolveCssColor = (value: string): string => {
      const varMatch = value.match(/^var\((--[\w-]+)\)$/);
      if (varMatch?.[1]) {
        return getComputedStyle(document.documentElement)
          .getPropertyValue(varMatch[1])
          .trim();
      }
      return value;
    };

    // Resolve background color for the fade layer
    const resolveBgColor = (): string =>
      backgroundColor ??
      getComputedStyle(container).backgroundColor ??
      "rgb(0, 0, 0)";

    // --- RENDER A SINGLE STATIC FRAME ---
    const renderStaticFrame = () => {
      init();
      // Let particles settle for a few ticks
      for (let tick = 0; tick < 30; tick++) {
        particles.forEach((p) => p.update());
      }
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      const resolvedColor = resolveCssColor(color);
      particles.forEach((p) => {
        p.draw(ctx, resolvedColor);
      });
      ctx.globalAlpha = 1;
    };

    // --- ANIMATION LOOP ---
    const animate = () => {
      // Reset globalAlpha before drawing the fade layer
      ctx.globalAlpha = 1;

      const bgColor = resolveBgColor();
      const rgbMatch = bgColor.match(/\d+/g);
      if (rgbMatch && rgbMatch.length >= 3) {
        const [r, g, b] = rgbMatch.map(Number);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailOpacity})`;
      } else {
        ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
      }
      ctx.fillRect(0, 0, width, height);

      const resolvedColor = resolveCssColor(color);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx, resolvedColor);
      });

      // Reset globalAlpha after all particles so next frame's fade layer is correct
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    // --- EVENT LISTENERS ---
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      if (reducedMotion) {
        renderStaticFrame();
      } else {
        init();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Start — static frame for reduced motion, full animation otherwise
    if (reducedMotion) {
      renderStaticFrame();
    } else {
      init();
      animate();
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (!reducedMotion) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [color, trailOpacity, particleCount, speed, backgroundColor, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-background overflow-hidden",
        className,
      )}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
