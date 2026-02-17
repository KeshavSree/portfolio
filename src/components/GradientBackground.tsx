import { useState, useEffect, useRef, useCallback } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

interface ZoneConfig {
  cameraZoom: number;
  cAzimuthAngle: number;
  cPolarAngle: number;
  cDistance: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  positionX: number;
  fov: number;
  pixelDensity: number;
  uDensity: number;
  uSpeed: number;
  uStrength: number;
  type: "sphere" | "waterPlane";
}

const ZONE_CONFIGS: ZoneConfig[] = [
  // Zone 0 - Intro: large, off-screen right
  { cameraZoom: 5.0, cAzimuthAngle: 160, cPolarAngle: 90, cDistance: 2.5,
    rotationX: 0, rotationY: 0, rotationZ: 0, positionX: -2.9,
    fov: 45, pixelDensity: 1.3, uDensity: 3, uSpeed: 0.1, uStrength: 3.8,
    type: "sphere" },
  // Zone 1 - About: top right, arc inward
  { cameraZoom: 2.3, cAzimuthAngle: 180, cPolarAngle: 70, cDistance: 3.6,
    rotationX: 45, rotationY: 10, rotationZ: 50, positionX: -2.6,
    fov: 45, pixelDensity: 1.3, uDensity: 3, uSpeed: 0.1, uStrength: 3.8,
    type: "sphere" },
  // Zone 2 - Experience: center right, popped out toward edge
  { cameraZoom: 2.3, cAzimuthAngle: 180, cPolarAngle: 90, cDistance: 3.6,
    rotationX: 90, rotationY: 30, rotationZ: 100, positionX: -3.4,
    fov: 45, pixelDensity: 1.3, uDensity: 3, uSpeed: 0.1, uStrength: 3.8,
    type: "sphere" },
  // Zone 3 - Projects: bottom right, arc inward
  { cameraZoom: 2.3, cAzimuthAngle: 180, cPolarAngle: 110, cDistance: 3.6,
    rotationX: 5, rotationY: 50, rotationZ: 30, positionX: -2.6,
    fov: 45, pixelDensity: 1.3, uDensity: 3, uSpeed: 0.1, uStrength: 3.8,
    type: "sphere" },
  // Zone 4 - Contact: water plane
  { cameraZoom: 1, cAzimuthAngle: 180, cPolarAngle: 90, cDistance: 3.6,
    rotationX: 0, rotationY: 10, rotationZ: 50, positionX: -1.4,
    fov: 50, pixelDensity: 1, uDensity: 1.3, uSpeed: 0.4, uStrength: 4,
    type: "waterPlane" },
];

type NumericProps = Omit<ZoneConfig, "type">;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

const TRANSITION_DURATION = 700;

export default function GradientBackground() {
  const [gradientProps, setGradientProps] = useState<ZoneConfig>({
    ...ZONE_CONFIGS[0],
  });

  const currentRef = useRef<ZoneConfig>({ ...ZONE_CONFIGS[0] });
  const animFrameRef = useRef<number>(0);

  const animateTo = useCallback((target: ZoneConfig) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    const from: ZoneConfig = { ...currentRef.current };
    const startTime = performance.now();

    const numericKeys: (keyof NumericProps)[] = [
      "cameraZoom", "cAzimuthAngle", "cPolarAngle", "cDistance",
      "rotationX", "rotationY", "rotationZ", "positionX",
      "fov", "pixelDensity", "uDensity", "uSpeed", "uStrength",
    ];

    function step(now: number) {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / TRANSITION_DURATION, 1);
      const t = easeOutCubic(rawT);

      const newProps: ZoneConfig = { type: target.type } as ZoneConfig;
      for (const key of numericKeys) {
        newProps[key] = lerp(from[key], target[key], t);
      }

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
      const config = ZONE_CONFIGS[zoneIndex];
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
        cAzimuthAngle={gradientProps.cAzimuthAngle}
        cDistance={gradientProps.cDistance}
        cPolarAngle={gradientProps.cPolarAngle}
        cameraZoom={gradientProps.cameraZoom}
        color1="#7b2cbf"
        color2="#d17db8"
        color3="#e6d0de"
        destination="onCanvas"
        embedMode="off"
        envPreset="city"
        format="gif"
        fov={gradientProps.fov}
        frameRate={10}
        gizmoHelper="hide"
        grain="on"
        lightType="3d"
        pixelDensity={gradientProps.pixelDensity}
        positionX={gradientProps.positionX}
        positionY={0}
        positionZ={0}
        range="disabled"
        rangeEnd={40}
        rangeStart={0}
        reflection={0.1}
        rotationX={gradientProps.rotationX}
        rotationY={gradientProps.rotationY}
        rotationZ={gradientProps.rotationZ}
        shader="defaults"
        type={gradientProps.type}
        uAmplitude={1}
        uDensity={gradientProps.uDensity}
        uFrequency={5.5}
        uSpeed={gradientProps.uSpeed}
        uStrength={gradientProps.uStrength}
        uTime={0}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  );
}
