"use client";

import React, { useEffect, useRef } from "react";

export function CosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Single airplane streak tracking across the horizon
    let planeX = -50;
    let planeY = height * 0.35;
    const planeSpeed = 0.45;

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // 1. Twilight sky background: deep #090909 near black void
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, "#090909");
      skyGrad.addColorStop(0.5, "#100d18");
      skyGrad.addColorStop(0.85, "#1b1429");
      skyGrad.addColorStop(1, "#090909");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Translucent lavender/violet atmospheric clouds wash
      const glowGrad = ctx.createRadialGradient(
        width * 0.6,
        height * 0.7,
        10,
        width * 0.6,
        height * 0.7,
        width * 0.7
      );
      glowGrad.addColorStop(0, "rgba(175, 80, 255, 0.08)");
      glowGrad.addColorStop(0.4, "rgba(225, 189, 255, 0.04)");
      glowGrad.addColorStop(1, "rgba(9, 9, 9, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Airplane light streak moving across the horizon
      planeX += planeSpeed;
      if (planeX > width + 60) {
        planeX = -60;
        planeY = height * (0.2 + Math.random() * 0.3);
      }

      // Airplane red/white navigation strobe
      const strobe = Math.sin(time * 6) > 0.4;
      if (strobe) {
        ctx.fillStyle = "#f7f9fa";
        ctx.beginPath();
        ctx.arc(planeX, planeY, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Faint red nav beacon
        ctx.fillStyle = "#af50ff";
        ctx.beginPath();
        ctx.arc(planeX - 6, planeY + 1, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Faint contrail
        ctx.strokeStyle = "rgba(247, 249, 250, 0.15)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(planeX - 35, planeY);
        ctx.lineTo(planeX - 6, planeY);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.95 }}
    />
  );
}
