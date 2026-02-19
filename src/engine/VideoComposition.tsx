import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { loadFont } from "@remotion/google-fonts/Inter";
import { GradientBackground } from "../components/GradientBackground";
import { DotGrid } from "../components/DotGrid";
import { ThemeProvider } from "./ThemeContext";
import { resolveConfig } from "./resolveConfig";
import { sceneRegistry } from "./registry";
import { BackgroundMusic } from "./BackgroundMusic";
import { ContinuousVoiceover } from "./ContinuousVoiceover";
import { getTransitionConfig } from "./transitions";
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

  const { width, height } = resolved.meta;

  // Build the TransitionSeries children: interleaved Sequences and Transitions
  const transitionSeriesChildren: React.ReactNode[] = [];

  resolved.scenes.forEach((scene, i) => {
    const { type, ...props } = scene;
    const Component = sceneRegistry[type];
    if (!Component) return;

    // Add the scene sequence
    transitionSeriesChildren.push(
      <TransitionSeries.Sequence
        key={`scene-${type}-${i}`}
        durationInFrames={scene.durationInFrames}
      >
        <Component {...props} />
      </TransitionSeries.Sequence>
    );

    // Add transition after this scene (except for the last scene)
    if (i < resolved.scenes.length - 1) {
      const transitionConfig = getTransitionConfig(
        scene.transition,
        width,
        height
      );

      if (transitionConfig) {
        transitionSeriesChildren.push(
          <TransitionSeries.Transition
            key={`transition-${i}`}
            presentation={transitionConfig.presentation}
            timing={transitionConfig.timing}
          />
        );
      }
    }
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

        <TransitionSeries>
          {transitionSeriesChildren}
        </TransitionSeries>
      </AbsoluteFill>
    </ThemeProvider>
  );
};
