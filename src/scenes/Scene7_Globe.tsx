import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import type { GlobeScene } from "../engine/types";

const edgeNodes = [
  { angle: 30, distance: 160 },
  { angle: 80, distance: 180 },
  { angle: 140, distance: 150 },
  { angle: 200, distance: 170 },
  { angle: 260, distance: 155 },
  { angle: 320, distance: 175 },
];

type Props = Omit<GlobeScene, "type">;

export const Scene7_Globe: React.FC<Props> = ({ durationInFrames, headline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors } = useTheme();

  const globeSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    delay: 3,
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const textOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rotation = frame * 0.8;
  const cx = 960;
  const cy = 500;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      <svg
        width={1920}
        height={1080}
        viewBox="0 0 1920 1080"
        style={{
          position: "absolute",
          opacity: globeSpring,
          transform: `scale(${0.8 + globeSpring * 0.2})`,
        }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={100}
          fill="none"
          stroke={colors.accent}
          strokeWidth={2}
          opacity={0.6}
        />
        <circle
          cx={cx}
          cy={cy}
          r={60}
          fill="none"
          stroke={colors.secondary}
          strokeWidth={1.5}
          opacity={0.4}
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={100}
          ry={40}
          fill="none"
          stroke={colors.accent}
          strokeWidth={1}
          opacity={0.3}
          transform={`rotate(${rotation} ${cx} ${cy})`}
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={100}
          ry={40}
          fill="none"
          stroke={colors.primary}
          strokeWidth={1}
          opacity={0.3}
          transform={`rotate(${rotation + 60} ${cx} ${cy})`}
        />
        <ellipse
          cx={cx}
          cy={cy}
          rx={100}
          ry={40}
          fill="none"
          stroke={colors.secondary}
          strokeWidth={1}
          opacity={0.3}
          transform={`rotate(${rotation + 120} ${cx} ${cy})`}
        />

        <circle cx={cx} cy={cy} r={8} fill={colors.accent} opacity={0.8} />
        <circle cx={cx} cy={cy} r={16} fill={colors.accent} opacity={0.2} />

        {edgeNodes.map((node, i) => {
          const nodeDelay = 5 + i * 4;
          const nodeSpring = spring({
            frame: frame - nodeDelay,
            fps,
            config: { damping: 12, stiffness: 150 },
          });

          const rad = ((node.angle + rotation * 0.3) * Math.PI) / 180;
          const nx = cx + Math.cos(rad) * node.distance;
          const ny = cy + Math.sin(rad) * node.distance;
          const pulse = 0.3 + Math.sin(frame * 0.15 + i) * 0.2;

          return (
            <g key={i} opacity={nodeSpring}>
              <line
                x1={cx}
                y1={cy}
                x2={nx}
                y2={ny}
                stroke={colors.accent}
                strokeWidth={1}
                opacity={pulse}
              />
              <circle cx={nx} cy={ny} r={5} fill={colors.accent} opacity={0.9} />
              <circle cx={nx} cy={ny} r={10} fill={colors.accent} opacity={0.15} />
            </g>
          );
        })}
      </svg>

      <div
        style={{
          position: "relative",
          marginTop: 260,
          opacity: textOpacity,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: colors.textPrimary,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {headline}
        </h2>
      </div>
    </div>
  );
};
