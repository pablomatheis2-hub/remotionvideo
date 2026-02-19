import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { useTheme } from "../engine/ThemeContext";
import { useSceneFade } from "../engine/useSceneFade";
import type { SplitImageScene } from "../engine/types";

type Props = Omit<SplitImageScene, "type">;

export const Scene16_SplitImage: React.FC<Props> = ({
  durationInFrames,
  title,
  subtitle,
  image,
  imagePosition = "right",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { colors, gradients } = useTheme();

  const opacity = useSceneFade({ durationInFrames, fadeInFrames: 8, fadeOutFrames: 12 });

  const textSlide = spring({
    frame: frame - 3,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const imageSlide = spring({
    frame: frame - 8,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const subtitleOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [15, 25], [12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isImageLeft = imagePosition === "left";
  const textOffset = isImageLeft
    ? (1 - textSlide) * 50
    : (1 - textSlide) * -50;
  const imageOffset = isImageLeft
    ? (1 - imageSlide) * -50
    : (1 - imageSlide) * 50;

  const isUrl = image.startsWith("http") || image.startsWith("/");

  const textSide = (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 80px",
        opacity: textSlide,
        transform: `translateX(${textOffset}px)`,
      }}
    >
      <h2
        style={{
          fontSize: 60,
          fontWeight: 800,
          color: colors.textPrimary,
          fontFamily: "Inter, sans-serif",
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 22,
            fontWeight: 400,
            color: colors.textSecondary,
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
            marginTop: 24,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        style={{
          marginTop: 32,
          height: 4,
          borderRadius: 2,
          width: `${textSlide * 120}px`,
          background: gradients.accentText,
        }}
      />
    </div>
  );

  const imageSide = (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: imageSlide,
        transform: `translateX(${imageOffset}px)`,
      }}
    >
      {isUrl ? (
        <img
          src={image}
          style={{
            maxWidth: "80%",
            maxHeight: "80%",
            borderRadius: 20,
            objectFit: "contain",
          }}
        />
      ) : (
        <span style={{ fontSize: 280, lineHeight: 1 }}>{image}</span>
      )}
    </div>
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "stretch",
        opacity,
      }}
    >
      {isImageLeft ? (
        <>
          {imageSide}
          {textSide}
        </>
      ) : (
        <>
          {textSide}
          {imageSide}
        </>
      )}
    </div>
  );
};
