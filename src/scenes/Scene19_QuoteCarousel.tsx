import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { QuoteCarouselScene } from "../engine/types";

type Props = Omit<QuoteCarouselScene, "type">;

export const Scene19_QuoteCarousel: React.FC<Props> = ({
  durationInFrames,
  quotes,
}) => {
  const frame = useCurrentFrame();
  const { colors, gradients } = useTheme();

  const sceneFade = useSceneFade({ durationInFrames, fadeInFrames: 8, fadeOutFrames: 12 });

  const count = quotes.length;
  if (count === 0) return null;

  const fadeFrames = 12;
  const framesPerQuote = durationInFrames / count;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneFade,
      }}
    >
      {quotes.map((q, i) => {
        const start = i * framesPerQuote;
        const end = start + framesPerQuote;

        const fadeIn = interpolate(frame, [start, start + fadeFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const fadeOut = interpolate(
          frame,
          [end - fadeFrames, end],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const quoteOpacity = Math.min(fadeIn, fadeOut);

        if (quoteOpacity <= 0) return null;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              inset: 0,
              opacity: quoteOpacity,
            }}
          >
            <div
              style={{
                width: 900,
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 24,
                padding: "60px 64px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 28,
                boxShadow: colors.cardShadow,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 40,
                  fontSize: 180,
                  fontWeight: 900,
                  fontFamily: "Inter, sans-serif",
                  background: gradients.accentText,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  opacity: 0.08,
                  lineHeight: 1,
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                &ldquo;
              </div>

              <p
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: colors.textPrimary,
                  fontFamily: "Inter, sans-serif",
                  textAlign: "center",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                  maxWidth: 780,
                }}
              >
                &ldquo;{q.text}&rdquo;
              </p>

              <div
                style={{
                  width: 80,
                  height: 2,
                  background: gradients.accentText,
                  borderRadius: 1,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: colors.textPrimary,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {q.author}
                </span>
                {q.role && (
                  <span
                    style={{
                      fontSize: 15,
                      color: colors.textSecondary,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {q.role}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
