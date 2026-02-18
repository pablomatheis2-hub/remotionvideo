import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../engine/ThemeContext";

interface GlowEffectProps {
  color?: string;
  size?: number;
  intensity?: number;
  pulse?: boolean;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  color,
  size = 400,
  intensity = 0.4,
  pulse = true,
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();
  const glowColor = color ?? colors.primary;
  const pulseScale = pulse ? 1 + Math.sin(frame * 0.05) * 0.1 : 1;
  const pulseOpacity = pulse
    ? intensity + Math.sin(frame * 0.04) * 0.1
    : intensity;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${glowColor}${Math.round(pulseOpacity * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        transform: `scale(${pulseScale})`,
        position: "absolute",
        pointerEvents: "none",
      }}
    />
  );
};
