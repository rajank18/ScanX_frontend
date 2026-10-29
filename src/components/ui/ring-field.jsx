import { useEffect, useRef } from "react";

/**
 * RingField Component
 * Wavy rings of fine dust drifting outward from a dark center.
 * Features ribbon twisting, wave lobes, sparkle particles, and responsive canvas sizing.
 */
export default function RingField({
  colors = ["#2f6fe0", "#b8f3ff"],
  backgroundColor = "transparent",
  rings = 6,
  particles = 22000,
  thickness = 0.34,
  folds = 3,
  fold = 0.9,
  dust = 0.14,
  innerRadius = 0.38,
  outerRadius = 1.25,
  flow = "outward",
  flowSpeed = 0.05,
  morph = 0.13,
  lobes = 3,
  turbulence = 0.45,
  sparkle = 0.06,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Parse hex color to RGB
    const hexToRgb = (hex) => {
      let c = hex.replace("#", "");
      if (c.length === 3) c = c.split("").map((x) => x + x).join("");
      const num = parseInt(c, 16);
      return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
      };
    };

    const colorOuter = hexToRgb(colors[0] || "#2f6fe0");
    const colorInner = hexToRgb(colors[1] || "#b8f3ff");

    // Pre-generate particle distribution
    const count = Math.min(particles, 28000);
    const particleData = new Float32Array(count * 5); // [ringIndex, baseAngle, radialOffset, speedFactor, isSparkle]

    for (let i = 0; i < count; i++) {
      const idx = i * 5;
      const ringIdx = Math.floor(Math.random() * rings);
      const angle = Math.random() * Math.PI * 2;
      const isDust = Math.random() < dust;
      const radialOffset = isDust
        ? (Math.random() - 0.5) * 1.5
        : (Math.random() - 0.5) * thickness;
      const speedFactor = 0.85 + Math.random() * 0.3;
      const isSparkle = Math.random() < sparkle ? 1 : 0;

      particleData[idx] = ringIdx;
      particleData[idx + 1] = angle;
      particleData[idx + 2] = radialOffset;
      particleData[idx + 3] = speedFactor;
      particleData[idx + 4] = isSparkle;
    }

    const resize = () => {
      const parent = canvas.parentElement || window;
      const rect = canvas.getBoundingClientRect();
      width = rect.width || (parent instanceof HTMLElement ? parent.offsetWidth : window.innerWidth);
      height = rect.height || (parent instanceof HTMLElement ? parent.offsetHeight : window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
      mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener("pointermove", handleMouseMove, { passive: true });

    let t = 0;

    const render = () => {
      t += 0.016;

      // Smooth pointer tracking
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      const pointerOffsetX = (m.x - 0.5) * 40;
      const pointerOffsetY = (m.y - 0.5) * 40;

      // Clear or paint background
      if (backgroundColor && backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      const centerX = width / 2 + pointerOffsetX;
      const centerY = height / 2 + pointerOffsetY;
      const baseRadius = Math.min(width, height) * 0.5;

      const flowDir = flow === "inward" ? -1 : 1;
      const ringCycle = t * flowSpeed * flowDir;

      // Render fine dust particles
      for (let i = 0; i < count; i++) {
        const idx = i * 5;
        const ringBase = particleData[idx];
        const baseAngle = particleData[idx + 1];
        const radialOffset = particleData[idx + 2];
        const speed = particleData[idx + 3];
        const isSparkle = particleData[idx + 4] === 1;

        // Progress of this particle's ring between inner and outer radius
        let ringProgress = ((ringBase + ringCycle * speed) % rings) / rings;
        if (ringProgress < 0) ringProgress += 1;

        const currentRadiusNorm = innerRadius + ringProgress * (outerRadius - innerRadius);
        const rCurrent = baseRadius * currentRadiusNorm;

        // Wavy lobes distortion
        const lobeWave = Math.sin(baseAngle * lobes + t * 0.4) * (morph * rCurrent);
        const fineTurbulence = Math.sin(baseAngle * (lobes * 3) - t * 0.8) * (turbulence * 8);

        // Ribbon twist fold effect
        const foldTwist = Math.sin(baseAngle * folds + t * 0.3) * fold;
        const localRadial = radialOffset * (baseRadius / rings) * (0.3 + 0.7 * Math.abs(foldTwist));

        const finalR = Math.max(0, rCurrent + lobeWave + fineTurbulence + localRadial);
        const finalAngle = baseAngle + t * 0.02;

        const x = centerX + Math.cos(finalAngle) * finalR;
        const y = centerY + Math.sin(finalAngle) * finalR;

        // Fade in at inner radius, fade out at outer edge
        const edgeFade = Math.sin(ringProgress * Math.PI);
        if (edgeFade <= 0.02) continue;

        const alpha = Math.min(1, Math.max(0, edgeFade * (isSparkle ? 0.95 : 0.65)));

        // Interpolate color from inner to outer
        const rColor = Math.round(colorInner.r + (colorOuter.r - colorInner.r) * ringProgress);
        const gColor = Math.round(colorInner.g + (colorOuter.g - colorInner.g) * ringProgress);
        const bColor = Math.round(colorInner.b + (colorOuter.b - colorInner.b) * ringProgress);

        ctx.fillStyle = isSparkle
          ? `rgba(255, 255, 255, ${alpha})`
          : `rgba(${rColor}, ${gColor}, ${bColor}, ${alpha * 0.7})`;

        const pSize = isSparkle ? 1.8 : 1.1;
        ctx.fillRect(x, y, pSize, pSize);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMouseMove);
    };
  }, [
    colors,
    backgroundColor,
    rings,
    particles,
    thickness,
    folds,
    fold,
    dust,
    innerRadius,
    outerRadius,
    flow,
    flowSpeed,
    morph,
    lobes,
    turbulence,
    sparkle,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      style={{ display: "block", ...style }}
      aria-hidden="true"
    />
  );
}
export { RingField };
