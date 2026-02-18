import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { FullscreenQuoteScene } from "../engine/types";

type Props = Omit<FullscreenQuoteScene, "type">;

export const Scene26_FullscreenQuote: React.FC<Props> = ({
  durationInFrames,
  quote,
  author,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const quoteSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const authorSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 18, stiffness: 100 },
  });

  const opacityOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(quoteSpring, [0, 1], [0.95, 1]);

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
        opacity: opacityOut,
        padding: "0 100px",
      }}
    >
      {/* Quote mark */}
      <span
        style={{
          fontSize: 120,
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          background: gradients.accent,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 0.6,
          opacity: quoteSpring,
        }}
      >
        {"\u201C"}
      </span>

      <span
        style={{
          fontSize: 52,
          fontWeight: 700,
          fontFamily: "Inter, sans-serif",
          color: colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: 900,
          opacity: quoteSpring,
          transform: `scale(${scale})`,
        }}
      >
        {quote}
      </span>

      {author && (
        <span
          style={{
            fontSize: 22,
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            color: colors.textSecondary,
            opacity: authorSpring,
            transform: `translateY(${(1 - authorSpring) * 12}px)`,
          }}
        >
          {"\u2014"} {author}
        </span>
      )}
    </div>
  );
};
