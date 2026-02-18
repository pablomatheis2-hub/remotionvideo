import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { GlassCard } from "../components/GlassCard";
import { AnimatedText } from "../components/AnimatedText";
import { useTheme } from "../engine/ThemeContext";
import type { TestimonialScene } from "../engine/types";

type Props = Omit<TestimonialScene, "type">;

export const Scene12_Testimonial: React.FC<Props> = ({
  durationInFrames,
  quote,
  author,
  role,
  avatarEmoji = "\u{1F464}",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacityIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: "clamp",
  });
  const opacityOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = Math.min(opacityIn, opacityOut);

  const cardSpring = spring({
    frame: frame - 3,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const quoteMarkOpacity = interpolate(frame, [0, 15], [0, 0.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dividerProgress = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const authorOpacity = interpolate(frame, [35, 45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const authorY = interpolate(frame, [35, 45], [10, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          opacity: cardSpring,
          transform: `translateY(${(1 - cardSpring) * 20}px)`,
        }}
      >
        <GlassCard width={900} height={420} floatAmplitude={3}>
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 40,
              fontSize: 200,
              fontWeight: 900,
              fontFamily: "Inter, sans-serif",
              background: gradients.accentText,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: quoteMarkOpacity,
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            &ldquo;
          </div>

          <div style={{ position: "relative", zIndex: 1, maxWidth: 780, padding: "0 20px" }}>
            <AnimatedText
              text={quote}
              startFrame={5}
              staggerDelay={4}
              mode="word"
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: colors.textPrimary,
                fontFamily: "Inter, sans-serif",
                textAlign: "center",
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            />
          </div>

          <div
            style={{
              width: `${dividerProgress * 120}px`,
              height: 2,
              background: gradients.accentText,
              borderRadius: 1,
              marginTop: 8,
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: authorOpacity,
              transform: `translateY(${authorY}px)`,
            }}
          >
            <span style={{ fontSize: 32 }}>{avatarEmoji}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: colors.textPrimary,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {author}
              </span>
              {role && (
                <span
                  style={{
                    fontSize: 15,
                    color: colors.textSecondary,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {role}
                </span>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
