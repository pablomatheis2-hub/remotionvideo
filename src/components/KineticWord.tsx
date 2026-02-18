import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";

interface KineticWordProps {
  word: string;
  enterFrame: number;
  exitFrame: number;
}

export const KineticWord: React.FC<KineticWordProps> = ({
  word,
  enterFrame,
  exitFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const progress = spring({
    frame: frame - enterFrame,
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  const scale = interpolate(progress, [0, 1], [1.15, 1]);

  const exitOpacity = interpolate(frame, [exitFrame - 6, exitFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterOpacity = frame >= enterFrame ? 1 : 0;
  const opacity = Math.min(enterOpacity, exitOpacity);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <span
        style={{
          fontSize: 130,
          fontWeight: 900,
          fontFamily: "Inter, sans-serif",
          color: colors.textPrimary,
          letterSpacing: "-0.04em",
        }}
      >
        {word}
      </span>
    </div>
  );
};
