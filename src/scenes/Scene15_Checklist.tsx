import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { ChecklistScene } from "../engine/types";

type Props = Omit<ChecklistScene, "type">;

export const Scene15_Checklist: React.FC<Props> = ({
  durationInFrames,
  title,
  items,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacityIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(opacityIn, opacityOut);

  const titleOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [5, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const checkSize = 32;
  const checkRadius = checkSize / 2;
  const circumference = 2 * Math.PI * (checkRadius - 3);

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
        gap: 48,
      }}
    >
      <h2
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {items.map((item, i) => {
          const itemDelay = 20 + i * 15;
          const itemSpring = spring({
            frame: frame - itemDelay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          // Circle stroke draw animation
          const strokeProgress = spring({
            frame: frame - itemDelay,
            fps,
            config: { damping: 20, stiffness: 80 },
          });

          // Checkmark draws slightly after circle
          const checkProgress = spring({
            frame: frame - (itemDelay + 8),
            fps,
            config: { damping: 16, stiffness: 100 },
          });

          // Glow flash on completion
          const glowFlash = interpolate(
            frame,
            [itemDelay + 10, itemDelay + 18, itemDelay + 30],
            [0, 0.8, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          // Gentle float after appearing
          const floatY = itemSpring > 0.9 ? Math.sin((frame - itemDelay) * 0.04) * 3 : 0;

          // Checkmark path length (approximate for the check shape)
          const checkPathLength = 28;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: itemSpring,
                transform: `translateY(${(1 - itemSpring) * 30 + floatY}px)`,
              }}
            >
              {/* SVG circle + checkmark */}
              <div style={{ position: "relative", width: checkSize, height: checkSize, flexShrink: 0 }}>
                {/* Glow */}
                <div
                  style={{
                    position: "absolute",
                    inset: -8,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${colors.primary}${Math.round(glowFlash * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                <svg width={checkSize} height={checkSize} viewBox={`0 0 ${checkSize} ${checkSize}`}>
                  {/* Circle */}
                  <circle
                    cx={checkRadius}
                    cy={checkRadius}
                    r={checkRadius - 3}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={2.5}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - strokeProgress)}
                    strokeLinecap="round"
                  />
                  {/* Checkmark */}
                  <path
                    d={`M ${checkSize * 0.28} ${checkSize * 0.5} L ${checkSize * 0.44} ${checkSize * 0.66} L ${checkSize * 0.72} ${checkSize * 0.36}`}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={checkPathLength}
                    strokeDashoffset={checkPathLength * (1 - checkProgress)}
                  />
                </svg>
              </div>

              <span
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: colors.textPrimary,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
