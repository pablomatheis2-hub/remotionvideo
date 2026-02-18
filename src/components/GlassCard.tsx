import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../engine/ThemeContext";

interface GlassCardProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  floatAmplitude?: number;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  width = 340,
  height = 380,
  floatAmplitude = 4,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const floatY = Math.sin(frame * 0.03) * floatAmplitude;

  return (
    <div
      style={{
        width,
        height,
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 20,
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        transform: `translateY(${floatY}px)`,
        boxShadow: colors.cardShadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
