import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { TimelineScene } from "../engine/types";

type Props = Omit<TimelineScene, "type">;

export const Scene11_Timeline: React.FC<Props> = ({
  durationInFrames,
  title,
  steps,
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

  const nodeSize = 64;
  const nodeSpacing = 200;
  const totalWidth = (steps.length - 1) * nodeSpacing;
  const startX = -totalWidth / 2;

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
        gap: 60,
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
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          width: totalWidth + nodeSize + 40,
        }}
      >
        {/* SVG connectors */}
        <svg
          style={{ position: "absolute", inset: 0 }}
          viewBox={`${startX - nodeSize / 2 - 20} -100 ${totalWidth + nodeSize + 40} 200`}
        >
          {steps.map((_, i) => {
            if (i === steps.length - 1) return null;
            const lineDelay = 20 + i * 18;
            const lineProgress = spring({
              frame: frame - lineDelay,
              fps,
              config: { damping: 20, stiffness: 80 },
            });
            const x1 = startX + i * nodeSpacing + nodeSize / 2;
            const x2 = startX + (i + 1) * nodeSpacing - nodeSize / 2;
            const lineLength = x2 - x1;

            return (
              <line
                key={`line-${i}`}
                x1={x1}
                y1={0}
                x2={x2}
                y2={0}
                stroke={colors.primary}
                strokeWidth={3}
                strokeDasharray={lineLength}
                strokeDashoffset={lineLength * (1 - lineProgress)}
                strokeLinecap="round"
                opacity={0.8}
              />
            );
          })}
        </svg>

        {/* Step nodes */}
        {steps.map((step, i) => {
          const nodeDelay = 15 + i * 18;
          const nodeSpring = spring({
            frame: frame - nodeDelay,
            fps,
            config: { damping: 12, stiffness: 120 },
          });
          const glowIntensity = Math.sin((frame - nodeDelay) * 0.08) * 0.3 + 0.5;
          const x = startX + i * nodeSpacing;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: `translate(calc(-50% + ${x}px), -50%) scale(${nodeSpring})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                opacity: nodeSpring,
              }}
            >
              <div
                style={{
                  width: nodeSize,
                  height: nodeSize,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  boxShadow: `0 0 ${20 + glowIntensity * 20}px ${colors.primary}${Math.round(glowIntensity * 100).toString(16).padStart(2, "0")}`,
                }}
              >
                {step.icon}
              </div>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
              {step.detail && (
                <span
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.detail}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
