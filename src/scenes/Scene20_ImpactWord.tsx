import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { ImpactWordScene } from "../engine/types";

type Props = Omit<ImpactWordScene, "type">;

export const Scene20_ImpactWord: React.FC<Props> = ({
  durationInFrames,
  word,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  // Crisp entrance — high damping kills the bounce
  const slam = spring({
    frame: frame - 1,
    fps,
    config: { damping: 24, stiffness: 260 },
  });

  const scale = interpolate(slam, [0, 1], [1.12, 1]);

  // Subtle background flash
  const flashOpacity = interpolate(frame, [0, 2, 10], [0.15, 0.1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Quick exit
  const exitOpacity = useSceneFade({ durationInFrames, fadeInFrames: 0, fadeOutFrames: 6 });

  // Subtitle
  const subtitleProgress = spring({
    frame: frame - 8,
    fps,
    config: { damping: 22, stiffness: 140 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        opacity: exitOpacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${colors.primary}, transparent 70%)`,
          opacity: flashOpacity,
          pointerEvents: "none",
        }}
      />

      <span
        style={{
          fontSize: 140,
          fontWeight: 900,
          fontFamily: "Inter, sans-serif",
          background: gradients.accent,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          opacity: slam,
          transform: `scale(${scale})`,
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        {word}
      </span>

      {subtitle && (
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: colors.textSecondary,
            fontFamily: "Inter, sans-serif",
            opacity: subtitleProgress,
            transform: `translateY(${(1 - subtitleProgress) * 10}px)`,
            textAlign: "center",
          }}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};
