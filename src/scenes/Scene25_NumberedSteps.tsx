import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { NumberedStepsScene } from "../engine/types";

type Props = Omit<NumberedStepsScene, "type">;

export const Scene25_NumberedSteps: React.FC<Props> = ({
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
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 44,
        opacity: opacityIn * opacityOut,
        padding: "0 100px",
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
          display: "flex",
          flexDirection: "column",
          gap: 28,
          width: "100%",
          maxWidth: 700,
        }}
      >
        {steps.map((step, i) => {
          const delay = 12 + i * 12;
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
                gap: 24,
                opacity: s,
                transform: `translateX(${(1 - s) * 40}px)`,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: gradients.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    fontFamily: "Inter, sans-serif",
                    color: "#fff",
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    color: colors.textPrimary,
                  }}
                >
                  {step.label}
                </span>
                {step.detail && (
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 400,
                      fontFamily: "Inter, sans-serif",
                      color: colors.textSecondary,
                    }}
                  >
                    {step.detail}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
