import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { IconGridScene } from "../engine/types";

type Props = Omit<IconGridScene, "type">;

export const Scene17_IconGrid: React.FC<Props> = ({
  durationInFrames,
  title,
  icons,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 8, fadeOutFrames: 12 });

  const titleOpacity = interpolate(frame, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [2, 10], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const columns = 3;

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
          margin: 0,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          maxWidth: columns * 300 + (columns - 1) * 24,
        }}
      >
        {icons.map((icon, i) => {
          const delay = 8 + i * 5;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 20, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                width: 280,
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 20,
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                boxShadow: colors.cardShadow,
                opacity: cardSpring,
                transform: `translateY(${(1 - cardSpring) * 20}px)`,
              }}
            >
              <span style={{ fontSize: 48, lineHeight: 1 }}>{icon.emoji}</span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  fontFamily: "Inter, sans-serif",
                  textAlign: "center",
                }}
              >
                {icon.label}
              </span>
              {icon.description && (
                <span
                  style={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                    textAlign: "center",
                    lineHeight: 1.5,
                  }}
                >
                  {icon.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
