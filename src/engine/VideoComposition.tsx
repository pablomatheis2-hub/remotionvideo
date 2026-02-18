import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { GradientBackground } from "../components/GradientBackground";
import { DotGrid } from "../components/DotGrid";
import { ThemeProvider } from "./ThemeContext";
import { resolveConfig } from "./resolveConfig";
import { sceneRegistry } from "./registry";
import { BackgroundMusic } from "./BackgroundMusic";
import { ContinuousVoiceover } from "./ContinuousVoiceover";
import type { VideoConfig, VoiceoverTimingData } from "./types";

interface Props {
  config: VideoConfig;
  timingData?: VoiceoverTimingData;
}

export const VideoComposition: React.FC<Props> = ({
  config,
  timingData,
}) => {
  const resolved = resolveConfig(config, timingData);

  const { fontFamily } = loadFont("normal", {
    weights: resolved.theme.fonts.weights as ("400" | "500" | "700" | "800" | "900")[],
    subsets: ["latin"],
  });

  // Accumulate start frames from sequential durations
  let currentFrame = 0;
  const scenesWithStart = resolved.scenes.map((scene) => {
    const from = currentFrame;
    currentFrame += scene.durationInFrames;
    return { ...scene, from };
  });

  return (
    <ThemeProvider theme={resolved.theme} brand={resolved.brand}>
      <AbsoluteFill
        style={{ fontFamily, background: resolved.theme.colors.background }}
      >
        <GradientBackground />
        <DotGrid />

        {resolved.audio.backgroundMusic && (
          <BackgroundMusic
            src={resolved.audio.backgroundMusic.src}
            volume={resolved.audio.backgroundMusic.volume}
          />
        )}

        {resolved.hasTimingData && (
          <ContinuousVoiceover volume={resolved.audio.voiceover.volume} />
        )}

        {scenesWithStart.map((scene, i) => {
          const { type, from, ...props } = scene;
          const Component = sceneRegistry[type];
          if (!Component) return null;

          return (
            <Sequence
              key={`${type}-${i}`}
              from={from}
              durationInFrames={scene.durationInFrames}
            >
              <Component {...props} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </ThemeProvider>
  );
};
