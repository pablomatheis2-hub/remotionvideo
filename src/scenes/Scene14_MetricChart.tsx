import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { MetricChartScene } from "../engine/types";

type Props = Omit<MetricChartScene, "type">;

export const Scene14_MetricChart: React.FC<Props> = ({
  durationInFrames,
  title,
  metrics,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeOutFrames: 25 });

  const titleOpacity = interpolate(frame, [5, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [5, 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const barMaxWidth = 600;

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

      <GlassCard width={860} height={metrics.length * 90 + 60} floatAmplitude={2}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            width: "100%",
          }}
        >
          {metrics.map((metric, i) => {
            const barDelay = 20 + i * 12;
            const barProgress = spring({
              frame: frame - barDelay,
              fps,
              config: { damping: 18, stiffness: 60 },
            });
            const fillWidth = barProgress * (metric.value / 100) * barMaxWidth;

            const valueOpacity = interpolate(
              barProgress * metric.value,
              [metric.value * 0.8, metric.value],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            const glowTrail = Math.max(0, Math.sin((frame - barDelay) * 0.06) * 0.6);

            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* Label */}
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                    width: 120,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {metric.label}
                </span>

                {/* Bar background */}
                <div
                  style={{
                    flex: 1,
                    height: 36,
                    borderRadius: 18,
                    background: `${colors.textSecondary}15`,
                    position: "relative",
                    overflow: "hidden",
                    maxWidth: barMaxWidth,
                  }}
                >
                  {/* Filled bar */}
                  <div
                    style={{
                      height: "100%",
                      width: fillWidth,
                      borderRadius: 18,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                      boxShadow: `0 0 ${12 + glowTrail * 20}px ${colors.primary}${Math.round((0.3 + glowTrail * 0.4) * 255).toString(16).padStart(2, "0")}`,
                      transition: "none",
                    }}
                  />
                </div>

                {/* Value */}
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: colors.textPrimary,
                    fontFamily: "Inter, sans-serif",
                    opacity: valueOpacity,
                    width: 80,
                    flexShrink: 0,
                  }}
                >
                  {metric.displayValue}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
