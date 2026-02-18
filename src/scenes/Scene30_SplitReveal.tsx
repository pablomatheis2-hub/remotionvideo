import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { SplitRevealScene } from "../engine/types";

type Props = Omit<SplitRevealScene, "type">;

export const Scene30_SplitReveal: React.FC<Props> = ({
  durationInFrames,
  headline,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacityOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Panels slide apart starting at frame 10
  const splitProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const leftX = interpolate(splitProgress, [0, 1], [0, -110]);
  const rightX = interpolate(splitProgress, [0, 1], [0, 110]);

  // Text appears after split
  const textSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 16, stiffness: 140 },
  });

  const subtitleSpring = spring({
    frame: frame - 30,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: opacityOut,
      }}
    >
      {/* Left panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          background: colors.primary,
          transform: `translateX(${leftX}%)`,
        }}
      />
      {/* Right panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background: colors.secondary,
          transform: `translateX(${rightX}%)`,
        }}
      />

      {/* Content underneath */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "0 80px",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: "Inter, sans-serif",
            background: gradients.accent,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textAlign: "center",
            lineHeight: 1.1,
            opacity: textSpring,
            transform: `scale(${interpolate(textSpring, [0, 1], [0.9, 1])})`,
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
              transform: `translateY(${(1 - subtitleSpring) * 12}px)`,
            }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
