import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { BrandLogo } from "../components/BrandLogo";
import { GlowEffect } from "../components/GlowEffect";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { LogoRevealScene } from "../engine/types";

type Props = Omit<LogoRevealScene, "type">;

export const Scene1_LogoReveal: React.FC<Props> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const scaleProgress = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 80 },
    delay: 8,
  });

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 15 });
  const glowPulse = 0.3 + Math.sin(frame * 0.06) * 0.15;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div style={{ position: "absolute" }}>
        <GlowEffect
          color={colors.primary}
          size={600}
          intensity={glowPulse}
          pulse={false}
        />
      </div>
      <div
        style={{
          transform: `scale(${scaleProgress * 1.2})`,
          filter: `drop-shadow(0 0 40px ${colors.primary}66)`,
        }}
      >
        <BrandLogo size={120} />
      </div>
    </div>
  );
};
