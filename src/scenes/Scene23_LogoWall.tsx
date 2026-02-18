import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { LogoWallScene } from "../engine/types";

type Props = Omit<LogoWallScene, "type">;

export const Scene23_LogoWall: React.FC<Props> = ({
  durationInFrames,
  title,
  logos,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacityIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const cols = Math.min(4, logos.length);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        opacity: opacityIn * opacityOut,
        padding: "0 80px",
      }}
    >
      {title && (
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: colors.textPrimary,
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 20}px)`,
          }}
        >
          {title}
        </span>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 28,
          width: "100%",
          maxWidth: 800,
        }}
      >
        {logos.map((logo, i) => {
          const delay = 12 + i * 5;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 16, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 24px",
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 12,
                opacity: s,
                transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
              }}
            >
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                  background: gradients.accent,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textAlign: "center",
                }}
              >
                {logo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
