import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { StackRevealScene } from "../engine/types";

type Props = Omit<StackRevealScene, "type">;

export const Scene34_StackReveal: React.FC<Props> = ({
  durationInFrames,
  cards,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacity = useSceneFade({ durationInFrames, combine: "multiply" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 500,
          height: 320,
        }}
      >
        {cards.map((card, i) => {
          const delay = 8 + i * 12;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 16, stiffness: 100 },
          });

          const offsetX = i * 16;
          const offsetY = i * -12;
          const rotation = (i - Math.floor(cards.length / 2)) * 2;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 20,
                padding: "36px 40px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                boxShadow: `0 8px 30px ${colors.cardShadow}`,
                opacity: s,
                transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation * s}deg) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
                zIndex: i,
              }}
            >
              {card.emoji && (
                <span style={{ fontSize: 40 }}>{card.emoji}</span>
              )}
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  background: gradients.accent,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {card.title}
              </span>
              {card.description && (
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 400,
                    fontFamily: "Inter, sans-serif",
                    color: colors.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  {card.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
