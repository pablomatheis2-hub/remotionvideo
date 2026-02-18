import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { BrowserMockupScene } from "../engine/types";

type Props = Omit<BrowserMockupScene, "type">;

export const Scene31_BrowserMockup: React.FC<Props> = ({
  durationInFrames,
  url,
  title,
  features,
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

  const browserSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: opacityIn * opacityOut,
        padding: "40px 80px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 860,
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `0 20px 60px ${colors.cardShadow}`,
          opacity: browserSpring,
          transform: `translateY(${(1 - browserSpring) * 30}px)`,
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderBottom: `1px solid ${colors.cardBorder}`,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 8 }}>
            {["#ff5f57", "#ffbd2e", "#27c840"].map((c) => (
              <div
                key={c}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            ))}
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              background: colors.background,
              borderRadius: 8,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 13, color: colors.textSecondary }}>
              {"\uD83D\uDD12"}
            </span>
            <span
              style={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                color: colors.textSecondary,
              }}
            >
              {url}
            </span>
          </div>
        </div>

        {/* Page content */}
        <div
          style={{
            padding: "44px 48px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              fontFamily: "Inter, sans-serif",
              background: gradients.accent,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </span>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {features.map((feature, i) => {
              const delay = 20 + i * 8;
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
                  <span
                    style={{
                      fontSize: 18,
                      color: colors.accent,
                    }}
                  >
                    {"\u2713"}
                  </span>
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 500,
                      fontFamily: "Inter, sans-serif",
                      color: colors.textPrimary,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
