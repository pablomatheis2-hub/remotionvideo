import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
} from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { SocialProofScene } from "../engine/types";

type Props = Omit<SocialProofScene, "type">;

export const Scene9_SocialProof: React.FC<Props> = ({
  durationInFrames,
  headline,
  count,
  companies,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const headlineSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 140 },
    delay: 3,
  });

  const fadeOut = useSceneFade({ durationInFrames, fadeInFrames: 0, fadeOutFrames: 12 });

  const counterProgress = interpolate(frame, [5, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const counterValue = Math.round(count * counterProgress).toLocaleString();

  // Replace {count} placeholder in headline with animated counter
  const headlineParts = headline.split("{count}");

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
          textAlign: "center",
          opacity: headlineSpring,
          transform: `translateY(${(1 - headlineSpring) * 20}px)`,
        }}
      >
        {headlineParts[0]}
        <span
          style={{
            background: gradients.accent,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {counterValue}+
        </span>
        {headlineParts[1] ?? ""}
      </h2>

      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {companies.map((name, i) => {
          const delay = 12 + i * 5;
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
                transform: `translateY(${(1 - pillSpring) * 20}px)`,
              }}
            >
              <div
                style={{
                  padding: "12px 28px",
                  borderRadius: 12,
                  background: colors.cardBg,
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${colors.cardBorder}`,
                  color: colors.textSecondary,
                  fontSize: 20,
                  fontWeight: 500,
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
