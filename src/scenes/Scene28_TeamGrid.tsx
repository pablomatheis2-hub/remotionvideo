import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { TeamGridScene } from "../engine/types";

type Props = Omit<TeamGridScene, "type">;

export const Scene28_TeamGrid: React.FC<Props> = ({
  durationInFrames,
  title,
  members,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacity = useSceneFade({ durationInFrames, combine: "multiply" });

  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 140 },
  });

  const cols = Math.min(4, members.length);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 44,
        opacity,
        padding: "0 80px",
      }}
    >
      {title && (
        <span
          style={{
            fontSize: 40,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: colors.textPrimary,
            opacity: titleSpring,
            transform: `translateY(${(1 - titleSpring) * 20}px)`,
          }}
        >
          {title}
        </span>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 28,
          maxWidth: 900,
          width: "100%",
        }}
      >
        {members.map((member, i) => {
          const delay = 10 + i * 6;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 16, stiffness: 120 },
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                padding: "28px 16px",
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 16,
                opacity: s,
                transform: `translateY(${(1 - s) * 30}px)`,
              }}
            >
              <span style={{ fontSize: 48 }}>
                {member.emoji ?? "\uD83D\uDE42"}
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: colors.textPrimary,
                  textAlign: "center",
                }}
              >
                {member.name}
              </span>
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "Inter, sans-serif",
                  background: gradients.accent,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textAlign: "center",
                }}
              >
                {member.role}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
