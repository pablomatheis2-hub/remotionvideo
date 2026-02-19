import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { ComparisonScene } from "../engine/types";

type Props = Omit<ComparisonScene, "type">;

export const Scene13_Comparison: React.FC<Props> = ({
  durationInFrames,
  title,
  before,
  after,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 8, fadeOutFrames: 12 });

  const titleOpacity = interpolate(frame, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [2, 10], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const leftSlide = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20, stiffness: 120 },
  });
  const rightSlide = spring({
    frame: frame - 14,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const dividerProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const panelWidth = 420;
  const panelHeight = 400;
  const panelStyle: React.CSSProperties = {
    width: panelWidth,
    height: panelHeight,
    background: colors.cardBg,
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: 20,
    padding: "32px 36px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: colors.cardShadow,
  };

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
      {title && (
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
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 40,
          position: "relative",
        }}
      >
        <div
          style={{
            ...panelStyle,
            opacity: leftSlide,
            transform: `translateX(${(1 - leftSlide) * -60}px)`,
          }}
        >
          <h3
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: colors.textSecondary,
              fontFamily: "Inter, sans-serif",
              margin: 0,
            }}
          >
            {before.label}
          </h3>
          {before.items.map((item, i) => {
            const itemDelay = 16 + i * 6;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: itemOpacity,
                }}
              >
                <span style={{ fontSize: 20, color: "#ef4444" }}>&#10005;</span>
                <span
                  style={{
                    fontSize: 18,
                    color: colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            width: 3,
            height: `${dividerProgress * panelHeight * 0.8}px`,
            background: gradients.accentText,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />

        <div
          style={{
            ...panelStyle,
            opacity: rightSlide,
            transform: `translateX(${(1 - rightSlide) * 60}px)`,
            position: "relative",
          }}
        >
          <h3
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              margin: 0,
              background: gradients.accentText,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {after.label}
          </h3>
          {after.items.map((item, i) => {
            const itemDelay = 22 + i * 6;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 8], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  opacity: itemOpacity,
                }}
              >
                <span style={{ fontSize: 20, color: "#22c55e" }}>&#10003;</span>
                <span
                  style={{
                    fontSize: 18,
                    color: colors.textPrimary,
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
