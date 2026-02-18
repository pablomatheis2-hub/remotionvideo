import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../engine/ThemeContext";

export const DotGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();

  const offsetX = frame * 0.12;
  const offsetY = frame * 0.08;

  return (
    <div
      style={{
        position: "absolute",
        inset: -80,
        backgroundImage: [
          `linear-gradient(${colors.gridLine} 1px, transparent 1px)`,
          `linear-gradient(90deg, ${colors.gridLine} 1px, transparent 1px)`,
        ].join(", "),
        backgroundSize: "48px 48px",
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        pointerEvents: "none",
      }}
    />
  );
};
