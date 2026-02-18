import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { BarChartScene } from "../engine/types";

type Props = Omit<BarChartScene, "type">;

export const Scene24_BarChart: React.FC<Props> = ({
  durationInFrames,
  title,
  bars,
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

  const maxValue = Math.max(...bars.map((b) => b.value));
  const chartHeight = 320;

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
        opacity: opacityIn * opacityOut,
        padding: "0 100px",
      }}
    >
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

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 32,
          height: chartHeight,
        }}
      >
        {bars.map((bar, i) => {
          const delay = 15 + i * 8;
          const growSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 14, stiffness: 80 },
          });

          const barHeight = (bar.value / maxValue) * chartHeight * growSpring;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: colors.textPrimary,
                  opacity: growSpring,
                }}
              >
                {bar.displayValue ?? bar.value}
              </span>
              <div
                style={{
                  width: 60,
                  height: barHeight,
                  background: gradients.accent,
                  borderRadius: "8px 8px 0 0",
                  minHeight: 4,
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                  color: colors.textSecondary,
                  textAlign: "center",
                  maxWidth: 80,
                }}
              >
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Baseline */}
      <div
        style={{
          width: bars.length * 92,
          height: 2,
          background: colors.gridLine,
          marginTop: -52,
        }}
      />
    </div>
  );
};
