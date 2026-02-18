import React from "react";
import { useCurrentFrame, spring, useVideoConfig } from "remotion";

interface AnimatedTextProps {
  text: string;
  startFrame?: number;
  staggerDelay?: number;
  style?: React.CSSProperties;
  mode?: "word" | "char";
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  startFrame = 0,
  staggerDelay = 12,
  style = {},
  mode = "word",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const units = mode === "word" ? text.split(" ") : text.split("");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: mode === "word" ? "0.3em" : 0,
        ...style,
      }}
    >
      {units.map((unit, i) => {
        const delay = startFrame + i * staggerDelay;
        const progress = spring({
          frame: frame - delay,
          fps,
          config: { damping: 14, stiffness: 120 },
        });

        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: progress,
              transform: `translateY(${(1 - progress) * 30}px)`,
              whiteSpace: mode === "word" ? "pre" : undefined,
            }}
          >
            {unit}
          </span>
        );
      })}
    </div>
  );
};
