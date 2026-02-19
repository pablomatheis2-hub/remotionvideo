import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { DonutChartScene } from "../engine/types";

type Props = Omit<DonutChartScene, "type">;

const PALETTE = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export const Scene27_DonutChart: React.FC<Props> = ({
  durationInFrames,
  title,
  segments,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const opacity = useSceneFade({ durationInFrames, combine: "multiply" });

  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const drawProgress = spring({
    frame: frame - 15,
    fps,
    config: { damping: 20, stiffness: 40 },
  });

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = 120;
  const strokeWidth = 36;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
        opacity,
        padding: "0 80px",
      }}
    >
      {/* Donut */}
      <svg width={300} height={300} viewBox="0 0 300 300">
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          const dashLength = circumference * fraction * drawProgress;
          const dashGap = circumference - dashLength;
          const rotation = accumulatedAngle * drawProgress;
          accumulatedAngle += fraction * 360;

          return (
            <circle
              key={i}
              cx={150}
              cy={150}
              r={radius}
              fill="none"
              stroke={seg.color ?? PALETTE[i % PALETTE.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashLength} ${dashGap}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${rotation - 90} 150 150)`}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: colors.textPrimary,
            opacity: titleSpring,
            marginBottom: 8,
          }}
        >
          {title}
        </span>
        {segments.map((seg, i) => {
          const delay = 25 + i * 6;
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
                gap: 12,
                opacity: s,
                transform: `translateX(${(1 - s) * 20}px)`,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: seg.color ?? PALETTE[i % PALETTE.length],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                  color: colors.textPrimary,
                }}
              >
                {seg.label}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: colors.textSecondary,
                }}
              >
                {seg.value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
