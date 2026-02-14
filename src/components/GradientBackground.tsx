import { useState, useEffect, useRef, useCallback } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

interface SectionConfig {
  color1: string;
  color2: string;
  color3: string;
  positionY: number;
}

const SECTION_CONFIGS: SectionConfig[] = [
  // Zone 0 - Intro (same as About)
  { color1: "#ff5005", color2: "#dbba95", color3: "#d0bce1", positionY: -1.8 },
  // Zone 1 - About: orange/tan/lavender, bottom-right
  { color1: "#ff5005", color2: "#dbba95", color3: "#d0bce1", positionY: -1.8 },
  // Zone 2 - Experience: deep blue/light blue-green/pale blue, middle-bottom-right
  { color1: "#0466c8", color2: "#7ab8cc", color3: "#c1d0c8", positionY: -0.6 },
  // Zone 3 - Projects: mid-green/green-yellow/pale mint, middle-top-right
  { color1: "#2eab5e", color2: "#a8d840", color3: "#d2ebd8", positionY: 0.6 },
  // Zone 4 - Contact: violet/pink-purple/light blush, top-right
  { color1: "#7b2cbf", color2: "#d17db8", color3: "#e6d0de", positionY: 1.8 },
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b))
      .toString(16)
      .slice(1)
  );
}

function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t
  );
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const TRANSITION_DURATION = 700;

export default function GradientBackground() {
  const [gradientProps, setGradientProps] = useState({
    color1: SECTION_CONFIGS[0].color1,
    color2: SECTION_CONFIGS[0].color2,
    color3: SECTION_CONFIGS[0].color3,
    positionY: SECTION_CONFIGS[0].positionY,
  });

  const currentRef = useRef({ ...gradientProps });
  const animFrameRef = useRef<number>(0);

  const animateTo = useCallback((target: SectionConfig) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const from = { ...currentRef.current };
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / TRANSITION_DURATION, 1);
      const t = easeOutCubic(rawT);

      const newProps = {
        color1: lerpColor(from.color1, target.color1, t),
        color2: lerpColor(from.color2, target.color2, t),
        color3: lerpColor(from.color3, target.color3, t),
        positionY: lerp(from.positionY, target.positionY, t),
      };

      currentRef.current = newProps;
      setGradientProps(newProps);

      if (rawT < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = 0;
      }
    }

    animFrameRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    function handleTransition(e: Event) {
      const { zoneIndex } = (e as CustomEvent<{ zoneIndex: number }>).detail;
      const config = SECTION_CONFIGS[zoneIndex];
      if (config) {
        animateTo(config);
      }
    }

    window.addEventListener("gradient-transition", handleTransition);
    return () => {
      window.removeEventListener("gradient-transition", handleTransition);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [animateTo]);

  return (
    <ShaderGradientCanvas
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <ShaderGradient
        animate="on"
        axesHelper="off"
        bgColor1="#000000"
        bgColor2="#000000"
        brightness={1.2}
        cAzimuthAngle={180}
        cDistance={3.6}
        cPolarAngle={90}
        cameraZoom={2.3}
        color1={gradientProps.color1}
        color2={gradientProps.color2}
        color3={gradientProps.color3}
        destination="onCanvas"
        embedMode="off"
        envPreset="city"
        format="gif"
        fov={45}
        frameRate={10}
        gizmoHelper="hide"
        grain="on"
        lightType="3d"
        pixelDensity={1.3}
        positionX={-2.9}
        positionY={gradientProps.positionY}
        positionZ={0}
        range="disabled"
        rangeEnd={40}
        rangeStart={0}
        reflection={0.1}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        shader="defaults"
        type="sphere"
        uAmplitude={1}
        uDensity={3}
        uFrequency={5.5}
        uSpeed={0.1}
        uStrength={3.8}
        uTime={0}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  );
}
