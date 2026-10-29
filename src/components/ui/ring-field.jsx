import { useEffect, useRef } from "react";

/**
 * RingField Component
 * Live interactive starry ring particle effect.
 * Features:
 * - Organic, non-circular concentric rings with natural harmonic waves/folds.
 * - Gentle counter-clockwise rotation and slow outward radial expansion.
 * - Stardust particles with individual scintillation/twinkle, diamond white & celestial cyan/blue tones,
 *   and subtle chromatic cosmic specks matching Image 2.
 * - Interactive hover explosion: mouse pushes particles away with dynamic blast physics,
 *   and removing the hover smoothly returns particles to their original wavy orbits with damped spring physics.
 */
export default function RingField({
  className = "",
  style = {},
  backgroundColor = "#04070b",
  numRings = 6,
  spinSpeed = 0.045, // Slow counter-clockwise rotation
  expandSpeed = 12, // Slow outward expansion (pixels/sec)
  blastRadius = 190, // Explosion influence radius
  blastPower = 16, // Explosion impulse strength
  springK = 0.048, // Return spring stiffness
  friction = 0.88, // Return velocity damping
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Track mouse & touch coordinates
    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
      lastMoved: 0,
    };

    // Responsive particle count
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const totalParticles = isMobile ? 9500 : 16500;

    // Define harmonic waveforms for each ring to ensure they are organic and non-circular
    const ringConfigs = [];
    for (let r = 0; r < numRings; r++) {
      ringConfigs.push({
        harmonicA: 0.08 + Math.random() * 0.12, // 2-lobe distortion
        harmonicB: 0.05 + Math.random() * 0.09, // 3-lobe distortion
        harmonicC: 0.03 + Math.random() * 0.06, // 5-lobe fine undulation
        phase1: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        phase3: Math.random() * Math.PI * 2,
        ringThickness: 14 + Math.random() * 16,
        spinMultiplier: 0.85 + Math.random() * 0.3,
      });
    }

    // Particle state arrays
    // Each particle: [currX, currY, vx, vy, ringIndex, angle, radialOffset, baseAlpha, twinkleSpeed, twinklePhase, size, colorType]
    // Packed into Float32Array and Uint8Array for maximum 60-120fps performance
    const posX = new Float32Array(totalParticles);
    const posY = new Float32Array(totalParticles);
    const velX = new Float32Array(totalParticles);
    const velY = new Float32Array(totalParticles);
    const ringIdx = new Uint8Array(totalParticles);
    const angles = new Float32Array(totalParticles);
    const radOffsets = new Float32Array(totalParticles);
    const baseAlphas = new Float32Array(totalParticles);
    const twinkleSpeeds = new Float32Array(totalParticles);
    const twinklePhases = new Float32Array(totalParticles);
    const sizes = new Float32Array(totalParticles);
    const colorTypes = new Uint8Array(totalParticles); // 0: Cyan, 1: Diamond White, 2: Celestial Blue, 3: Gold/Amber, 4: Radiant Pink

    // Pre-allocated ring base radii (will expand outwards)
    const ringRadii = new Float32Array(numRings);

    const initRingsAndParticles = () => {
      const minDim = Math.min(width, height);
      const minRadius = minDim * 0.16;
      const maxRadius = minDim * 0.78;
      const radiusStep = (maxRadius - minRadius) / numRings;

      for (let r = 0; r < numRings; r++) {
        ringRadii[r] = minRadius + r * radiusStep;
      }

      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < totalParticles; i++) {
        const rIdx = Math.floor(Math.random() * numRings);
        ringIdx[i] = rIdx;

        // Angle around the ring
        const theta = Math.random() * Math.PI * 2;
        angles[i] = theta;

        // Gaussian-like radial dispersion across the ring's ribbon
        const u1 = Math.random() || 0.001;
        const u2 = Math.random() || 0.001;
        const normalRand = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        radOffsets[i] = normalRand * (ringConfigs[rIdx].ringThickness * 0.5);

        // Brightness and scintillation
        baseAlphas[i] = 0.3 + Math.random() * 0.65;
        twinkleSpeeds[i] = 1.2 + Math.random() * 3.8;
        twinklePhases[i] = Math.random() * Math.PI * 2;

        // 10% super sparkle particles (larger with diamond glow)
        const isSuper = Math.random() < 0.1;
        sizes[i] = isSuper ? 1.8 + Math.random() * 0.8 : 0.8 + Math.random() * 0.7;

        // Color distributions matching Image 2
        const colorRand = Math.random();
        if (colorRand < 0.55) {
          colorTypes[i] = 0; // Vibrant Electric Cyan (#67e8f9)
        } else if (colorRand < 0.82) {
          colorTypes[i] = 1; // Pure Diamond White (#f0f9ff)
        } else if (colorRand < 0.94) {
          colorTypes[i] = 2; // Ice Celestial Blue (#93c5fd)
        } else if (colorRand < 0.97) {
          colorTypes[i] = 3; // Golden amber accent speck (#fde047)
        } else {
          colorTypes[i] = 4; // Radiant pink accent speck (#f472b6)
        }

        // Calculate initial positions
        const cfg = ringConfigs[rIdx];
        const rBase = ringRadii[rIdx];
        const wave =
          1.0 +
          cfg.harmonicA * Math.sin(2 * theta + cfg.phase1) +
          cfg.harmonicB * Math.cos(3 * theta + cfg.phase2) +
          cfg.harmonicC * Math.sin(5 * theta + cfg.phase3);
        const finalR = rBase * wave + radOffsets[i];

        const x = centerX + Math.cos(theta) * finalR;
        const y = centerY + Math.sin(theta) * finalR;

        posX[i] = x;
        posY[i] = y;
        velX[i] = 0;
        velY[i] = 0;
      }
    };

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

      initRingsAndParticles();
    };

    resize();
    window.addEventListener("resize", resize);

    // Pointer listeners on window so interaction works across the entire page
    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
      pointer.lastMoved = performance.now();
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        pointer.x = touch.clientX - rect.left;
        pointer.y = touch.clientY - rect.top;
        pointer.active = true;
        pointer.lastMoved = performance.now();
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handlePointerLeave, { passive: true });

    let lastTime = performance.now();
    let ringGlobalAngle = 0;

    // Render loop
    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // Cap dt to avoid jump on tab switch
      lastTime = now;

      // Deactivate mouse after 1.5 seconds of no movement
      if (pointer.active && now - pointer.lastMoved > 1500) {
        pointer.active = false;
      }

      // Draw background space
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const minDim = Math.min(width, height);
      const minRadius = minDim * 0.16;
      const maxRadius = minDim * 0.82;

      // 1. Update ring base radii (moving outwards slowly / getting bigger)
      for (let r = 0; r < numRings; r++) {
        ringRadii[r] += expandSpeed * dt;
        if (ringRadii[r] > maxRadius) {
          ringRadii[r] = minRadius + (ringRadii[r] - maxRadius);
          // Gently mutate harmonic phases on respawn for natural evolving variation
          ringConfigs[r].phase1 += 0.4;
          ringConfigs[r].phase2 += 0.3;
        }
      }

      // 2. Slow anticlockwise spin
      ringGlobalAngle -= spinSpeed * dt;

      const px = pointer.x;
      const py = pointer.y;
      const pActive = pointer.active;
      const bRadSq = blastRadius * blastRadius;

      // 3. Update & render each particle
      for (let i = 0; i < totalParticles; i++) {
        const rIdx = ringIdx[i];
        const cfg = ringConfigs[rIdx];
        const rBase = ringRadii[rIdx];

        // Particle's angle spinning anticlockwise
        const curAngle = angles[i] + ringGlobalAngle * cfg.spinMultiplier;

        // Wavy organic ring radius at this angle (harmonic undulations)
        const wave =
          1.0 +
          cfg.harmonicA * Math.sin(2 * curAngle + cfg.phase1) +
          cfg.harmonicB * Math.cos(3 * curAngle + cfg.phase2) +
          cfg.harmonicC * Math.sin(5 * curAngle + cfg.phase3);

        const targetR = Math.max(10, rBase * wave + radOffsets[i]);

        // Target orbital position on the rotating, expanding ring
        const targetX = centerX + Math.cos(curAngle) * targetR;
        const targetY = centerY + Math.sin(curAngle) * targetR;

        // Interactive Explosion Force
        let curX = posX[i];
        let curY = posY[i];
        let vx = velX[i];
        let vy = velY[i];

        if (pActive) {
          const dxMouse = curX - px;
          const dyMouse = curY - py;
          const distSq = dxMouse * dxMouse + dyMouse * dyMouse;

          if (distSq < bRadSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const ratio = 1 - dist / blastRadius;
            const force = ratio * ratio * blastPower;

            // Explosion impulses: push particles radially away from mouse + slight cosmic scatter
            const scatter = (Math.sin(i * 13.7) - 0.5) * 2;
            vx += (dxMouse / dist) * force + scatter;
            vy += (dyMouse / dist) * force - scatter;
          }
        }

        // Restoring Spring Physics: smoothly return to original orbital position
        const dxTarget = targetX - curX;
        const dyTarget = targetY - curY;

        vx += dxTarget * springK;
        vy += dyTarget * springK;

        // Friction / velocity damping
        vx *= friction;
        vy *= friction;

        curX += vx;
        curY += vy;

        posX[i] = curX;
        posY[i] = curY;
        velX[i] = vx;
        velY[i] = vy;

        // Fade in when expanding from center, fade out near outer boundary
        let edgeAlpha = 1.0;
        if (rBase < minRadius + 50) {
          edgeAlpha = Math.max(0, (rBase - minRadius) / 50);
        } else if (rBase > maxRadius - 70) {
          edgeAlpha = Math.max(0, (maxRadius - rBase) / 70);
        }

        if (edgeAlpha <= 0.02) continue;

        // Twinkling sparkle modulation
        const twinkle = Math.sin(now * 0.001 * twinkleSpeeds[i] + twinklePhases[i]);
        const alpha = Math.min(1, Math.max(0, baseAlphas[i] * (0.68 + 0.32 * twinkle) * edgeAlpha));

        const size = sizes[i];
        const cType = colorTypes[i];

        // Draw stardust particle with appropriate color
        if (cType === 0) {
          ctx.fillStyle = `rgba(103, 232, 249, ${alpha})`; // Cyan
        } else if (cType === 1) {
          ctx.fillStyle = `rgba(240, 249, 255, ${alpha})`; // Diamond White
        } else if (cType === 2) {
          ctx.fillStyle = `rgba(147, 197, 253, ${alpha * 0.9})`; // Celestial Blue
        } else if (cType === 3) {
          ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.95})`; // Amber Gold
        } else {
          ctx.fillStyle = `rgba(244, 114, 182, ${alpha * 0.95})`; // Radiant Pink
        }

        ctx.fillRect(curX, curY, size, size);

        // Additional soft radial glow for larger sparkling stars
        if (size > 1.8 && alpha > 0.45) {
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.28})`;
          ctx.fillRect(curX - 1, curY - 1, size + 2, size + 2);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handlePointerLeave);
    };
  }, [
    backgroundColor,
    numRings,
    spinSpeed,
    expandSpeed,
    blastRadius,
    blastPower,
    springK,
    friction,
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
