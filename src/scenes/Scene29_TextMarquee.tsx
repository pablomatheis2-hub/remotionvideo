import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { TextMarqueeScene } from "../engine/types";

type Props = Omit<TextMarqueeScene, "type">;

export const Scene29_TextMarquee: React.FC<Props> = ({
  durationInFrames,
  words,
}) => {
  const frame = useCurrentFrame();
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

  // Create repeated text string for seamless scroll
  const repeatedText = Array(6).fill(words.join("  \u00B7  ")).join("  \u00B7  ");

  const rows = [
    { speed: 3, fontSize: 64, top: "18%", gradient: true },
    { speed: -2, fontSize: 48, top: "42%", gradient: false },
    { speed: 2.5, fontSize: 64, top: "66%", gradient: true },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        opacity: opacityIn * opacityOut,
      }}
    >
      {rows.map((row, i) => {
        const offset = frame * row.speed;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: row.top,
              whiteSpace: "nowrap",
              transform: `translateX(${-offset}px)`,
            }}
          >
            <span
              style={{
                fontSize: row.fontSize,
                fontWeight: 800,
                fontFamily: "Inter, sans-serif",
                ...(row.gradient
                  ? {
                      background: gradients.accent,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }
                  : {
                      color: colors.textSecondary,
                      opacity: 0.3,
                    }),
                letterSpacing: "-0.02em",
              }}
            >
              {repeatedText}
            </span>
          </div>
        );
      })}
    </div>
  );
};
