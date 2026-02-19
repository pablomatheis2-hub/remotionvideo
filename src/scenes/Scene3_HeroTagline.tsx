import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { AnimatedText } from "../components/AnimatedText";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { HeroTaglineScene } from "../engine/types";

type Props = Omit<HeroTaglineScene, "type">;

export const Scene3_HeroTagline: React.FC<Props> = ({
  durationInFrames,
  headline,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 8, fadeOutFrames: 12 });

  const underlineProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const subtitleOpacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [18, 28], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
        opacity,
        gap: 32,
      }}
    >
      <div style={{ position: "relative" }}>
        <AnimatedText
          text={headline}
          startFrame={2}
          staggerDelay={4}
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: colors.textPrimary,
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -8,
            left: "10%",
            height: 4,
            borderRadius: 2,
            width: `${underlineProgress * 80}%`,
            background: gradients.accentText,
          }}
        />
      </div>

      <p
        style={{
          fontSize: 22,
          fontWeight: 400,
          color: colors.textSecondary,
          fontFamily: "Inter, sans-serif",
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          textAlign: "center",
          maxWidth: 700,
          lineHeight: 1.6,
        }}
      >
        {subtitle}
      </p>
    </div>
  );
};
