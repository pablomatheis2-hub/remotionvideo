import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { WordCloudScene } from "../engine/types";

type Props = Omit<WordCloudScene, "type">;

// Deterministic pseudo-random based on index
function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export const Scene32_WordCloud: React.FC<Props> = ({
  durationInFrames,
  words,
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

  // Pre-calculate positions for each word
  const positions = words.map((_, i) => ({
    x: 10 + seeded(i * 2) * 80, // % from left
    y: 10 + seeded(i * 2 + 1) * 80, // % from top
    size: 20 + seeded(i * 3) * 40,
    rotation: (seeded(i * 4) - 0.5) * 20,
    useGradient: seeded(i * 5) > 0.5,
  }));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: opacityIn * opacityOut,
      }}
    >
      {words.map((word, i) => {
        const delay = 5 + i * 3;
        const s = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 100 },
        });
        const pos = positions[i];

        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              fontSize: pos.size,
              fontWeight: pos.size > 40 ? 800 : 600,
              fontFamily: "Inter, sans-serif",
              ...(pos.useGradient
                ? {
                    background: gradients.accent,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
                : {
                    color: colors.textPrimary,
                  }),
              opacity: s,
              transform: `rotate(${pos.rotation}deg) scale(${interpolate(s, [0, 1], [0.5, 1])})`,
              whiteSpace: "nowrap",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
