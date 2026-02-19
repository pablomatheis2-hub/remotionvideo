import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { FrameworksScene } from "../engine/types";

type Props = Omit<FrameworksScene, "type">;

export const Scene5_Frameworks: React.FC<Props> = ({
  durationInFrames,
  title,
  items,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const headerOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });

  const fadeOut = useSceneFade({ durationInFrames, fadeInFrames: 0, fadeOutFrames: 12 });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        opacity: fadeOut,
      }}
    >
      <h2
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          opacity: headerOpacity,
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {items.map((name, i) => {
          const delay = 8 + i * 6;
          const pillSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 150 },
          });

          return (
            <div
              key={name}
              style={{
                opacity: pillSpring,
                transform: `translateY(${(1 - pillSpring) * 30}px)`,
              }}
            >
              <div
                style={{
                  padding: "14px 32px",
                  borderRadius: 14,
                  background: colors.cardBg,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textPrimary,
                  fontSize: 24,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  boxShadow: colors.cardShadow,
                }}
              >
                {name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
