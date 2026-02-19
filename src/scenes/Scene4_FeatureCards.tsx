import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { FeatureCardsScene } from "../engine/types";

type Props = Omit<FeatureCardsScene, "type">;

export const Scene4_FeatureCards: React.FC<Props> = ({
  durationInFrames,
  title,
  features,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 15, fadeOutFrames: 25 });

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
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          transform: `translateY(${interpolate(frame, [5, 20], [20, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}px)`,
        }}
      >
        {title}
      </h2>

      <div style={{ display: "flex", gap: 32 }}>
        {features.map((feature, i) => {
          const cardDelay = 20 + i * 15;
          const cardSpring = spring({
            frame: frame - cardDelay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <div
              key={feature.title}
              style={{
                opacity: cardSpring,
                transform: `translateY(${(1 - cardSpring) * 60}px)`,
              }}
            >
              <GlassCard width={360} height={320} floatAmplitude={3 + i}>
                <span style={{ fontSize: 48 }}>{feature.icon}</span>
                <h3
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    fontFamily: "Inter, sans-serif",
                    margin: 0,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 400,
                    color: colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                    textAlign: "center",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.description}
                </p>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </div>
  );
};
