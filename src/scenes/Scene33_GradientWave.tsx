import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { GradientWaveScene } from "../engine/types";

type Props = Omit<GradientWaveScene, "type">;

export const Scene33_GradientWave: React.FC<Props> = ({
  durationInFrames,
  headline,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const opacity = useSceneFade({ durationInFrames, combine: "multiply" });

  const textSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const subtitleSpring = spring({
    frame: frame - 16,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  // Rotating gradient angle
  const angle = (frame * 2) % 360;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(${angle}deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
          opacity: 0.2,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "0 100px",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: "Inter, sans-serif",
            color: colors.textPrimary,
            textAlign: "center",
            lineHeight: 1.1,
            opacity: textSpring,
            transform: `translateY(${(1 - textSpring) * 30}px)`,
          }}
        >
          {headline}
        </span>
        {subtitle && (
          <span
            style={{
              fontSize: 26,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              color: colors.textSecondary,
              textAlign: "center",
              opacity: subtitleSpring,
              transform: `translateY(${(1 - subtitleSpring) * 15}px)`,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
