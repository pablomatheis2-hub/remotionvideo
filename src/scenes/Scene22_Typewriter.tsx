import React from "react";
import { useCurrentFrame } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { TypewriterScene } from "../engine/types";

type Props = Omit<TypewriterScene, "type">;

export const Scene22_Typewriter: React.FC<Props> = ({
  durationInFrames,
  text,
}) => {
  const frame = useCurrentFrame();
  const { colors } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 8, combine: "multiply" });

  // Type 1 character every 2 frames, starting at frame 8
  const typingStart = 8;
  const charsPerFrame = 0.5;
  const charsVisible = Math.min(
    text.length,
    Math.floor((frame - typingStart) * charsPerFrame)
  );

  const displayedText = frame < typingStart ? "" : text.slice(0, charsVisible);
  const cursorVisible = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        padding: "0 120px",
      }}
    >
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 16,
          padding: "48px 56px",
          maxWidth: 900,
          boxShadow: `0 8px 40px ${colors.cardShadow}`,
        }}
      >
        <span
          style={{
            fontSize: 38,
            fontWeight: 500,
            fontFamily: "'JetBrains Mono', monospace",
            color: colors.textPrimary,
            lineHeight: 1.5,
          }}
        >
          {displayedText}
          <span
            style={{
              opacity: cursorVisible ? 1 : 0,
              color: colors.primary,
              fontWeight: 300,
            }}
          >
            |
          </span>
        </span>
      </div>
    </div>
  );
};
