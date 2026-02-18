import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { BrandLogo } from "../components/BrandLogo";
import { useTheme } from "../engine/ThemeContext";
import type { CtaScene } from "../engine/types";

type Props = Omit<CtaScene, "type">;

export const Scene10_CTA: React.FC<Props> = ({
  durationInFrames,
  headline,
  buttonText,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const textSpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 140 },
    delay: 3,
  });

  const buttonSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const logoSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const fadeToBlack = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
        opacity: fadeToBlack,
      }}
    >
      <h2
        style={{
          fontSize: 52,
          fontWeight: 700,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          opacity: textSpring,
          transform: `translateY(${(1 - textSpring) * 20}px)`,
          textAlign: "center",
        }}
      >
        {headline}
      </h2>

      <div
        style={{
          opacity: buttonSpring,
          transform: `translateY(${(1 - buttonSpring) * 15}px)`,
        }}
      >
        <div
          style={{
            padding: "18px 48px",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            color: colors.white,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            boxShadow: `0 4px 20px ${colors.primary}33`,
            letterSpacing: "-0.01em",
          }}
        >
          {buttonText}
        </div>
      </div>

      <div
        style={{
          opacity: logoSpring,
          transform: `translateY(${(1 - logoSpring) * 10}px)`,
          marginTop: 16,
        }}
      >
        <BrandLogo size={48} />
      </div>
    </div>
  );
};
