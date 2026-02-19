import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { CountdownRevealScene } from "../engine/types";

type Props = Omit<CountdownRevealScene, "type">;

export const Scene21_CountdownReveal: React.FC<Props> = ({
  durationInFrames,
  headline,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacityOut = useSceneFade({ durationInFrames, fadeInFrames: 0 });

  const counts = [3, 2, 1];
  const countDuration = 20; // frames per number
  const revealStart = counts.length * countDuration;

  const revealSpring = spring({
    frame: frame - revealStart,
    fps,
    config: { damping: 18, stiffness: 200 },
  });

  const revealScale = interpolate(revealSpring, [0, 1], [1.3, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: opacityOut,
      }}
    >
      {frame < revealStart ? (
        counts.map((num, i) => {
          const start = i * countDuration;
          const end = start + countDuration;
          if (frame < start || frame >= end) return null;

          const localFrame = frame - start;
          const numSpring = spring({
            frame: localFrame,
            fps,
            config: { damping: 20, stiffness: 300 },
          });
          const scale = interpolate(numSpring, [0, 1], [2, 1]);
          const fade = interpolate(localFrame, [countDuration - 5, countDuration], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <span
              key={num}
              style={{
                fontSize: 260,
                fontWeight: 900,
                fontFamily: "Inter, sans-serif",
                background: gradients.accent,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transform: `scale(${scale})`,
                opacity: fade,
              }}
            >
              {num}
            </span>
          );
        })
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            opacity: revealSpring,
            transform: `scale(${revealScale})`,
          }}
        >
          <span
            style={{
              fontSize: 80,
              fontWeight: 900,
              fontFamily: "Inter, sans-serif",
              background: gradients.accent,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textAlign: "center",
              padding: "0 80px",
              lineHeight: 1.1,
            }}
          >
            {headline}
          </span>
        </div>
      )}
    </div>
  );
};
