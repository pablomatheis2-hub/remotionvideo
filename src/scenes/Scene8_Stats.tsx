import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { StatsScene } from "../engine/types";

type Props = Omit<StatsScene, "type">;

export const Scene8_Stats: React.FC<Props> = ({ durationInFrames, stats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeOutFrames: 25 });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div style={{ display: "flex", gap: 100 }}>
        {stats.map((stat, i) => {
          const delay = 8 + i * 10;
          const entrySpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          return (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: entrySpring,
                transform: `translateY(${(1 - entrySpring) * 40}px)`,
              }}
            >
              <AnimatedCounter
                to={stat.value}
                startFrame={delay}
                duration={40}
                decimals={stat.decimals ?? 0}
                suffix={stat.suffix}
                style={{
                  fontSize: 96,
                  fontWeight: 900,
                  fontFamily: "Inter, sans-serif",
                  background: gradients.accent,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              />
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: colors.textSecondary,
                  fontFamily: "Inter, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                }}
              >
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
