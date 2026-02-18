import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { PricingTableScene } from "../engine/types";

type Props = Omit<PricingTableScene, "type">;

export const Scene18_PricingTable: React.FC<Props> = ({
  durationInFrames,
  title,
  tiers,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacityIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(opacityIn, opacityOut);

  const titleOpacity = interpolate(frame, [2, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [2, 10], [15, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
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
            margin: 0,
          }}
        >
          {title}
        </h2>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 28,
        }}
      >
        {tiers.map((tier, i) => {
          const delay = 8 + i * 8;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 20, stiffness: 120 },
          });

          const isHighlighted = tier.highlighted === true;

          return (
            <div
              key={i}
              style={{
                width: 300,
                position: "relative",
                opacity: cardSpring,
                transform: `translateY(${(1 - cardSpring) * 25}px)`,
              }}
            >
              <div
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${isHighlighted ? colors.primary : colors.cardBorder}`,
                  borderRadius: 20,
                  padding: "36px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  boxShadow: isHighlighted
                    ? `${colors.cardShadow}, 0 0 30px ${colors.primary}22`
                    : colors.cardShadow,
                  height: "100%",
                  boxSizing: "border-box",
                }}
              >
                <h3
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    fontFamily: "Inter, sans-serif",
                    margin: 0,
                    textAlign: "center",
                  }}
                >
                  {tier.name}
                </h3>
                <div style={{ textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      fontFamily: "Inter, sans-serif",
                      ...(isHighlighted
                        ? {
                            background: gradients.accentText,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }
                        : { color: colors.textPrimary }),
                    }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span
                      style={{
                        fontSize: 16,
                        color: colors.textSecondary,
                        fontFamily: "Inter, sans-serif",
                        marginLeft: 4,
                      }}
                    >
                      /{tier.period}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    height: 1,
                    background: colors.cardBorder,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {tier.features.map((feature, fi) => {
                    const featureDelay = delay + 12 + fi * 4;
                    const featureOpacity = interpolate(
                      frame,
                      [featureDelay, featureDelay + 8],
                      [0, 1],
                      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                    );
                    return (
                      <div
                        key={fi}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          opacity: featureOpacity,
                        }}
                      >
                        <span style={{ fontSize: 16, color: colors.accent }}>
                          &#10003;
                        </span>
                        <span
                          style={{
                            fontSize: 15,
                            color: colors.textSecondary,
                            fontFamily: "Inter, sans-serif",
                            lineHeight: 1.5,
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
          );
        })}
      </div>
    </div>
  );
};
