import React from "react";
import { Composition, staticFile } from "remotion";
import { VideoComposition } from "./engine/VideoComposition";
import { resolveConfig } from "./engine/resolveConfig";
import type { VideoConfig, VoiceoverTimingData } from "./engine/types";
import defaultConfig from "../remotion-engine-config.json";

async function loadTimingData(): Promise<VoiceoverTimingData | undefined> {
  try {
    const url = staticFile("voiceover/timing.json");
    const response = await fetch(url);
    if (!response.ok) return undefined;
    return (await response.json()) as VoiceoverTimingData;
  } catch {
    return undefined;
  }
}

export const Root: React.FC = () => {
  return (
    <Composition
      id="Video"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={VideoComposition as any}
      calculateMetadata={async ({ props }) => {
        const config = (props as { config: VideoConfig }).config;
        const timingData = await loadTimingData();
        const resolved = resolveConfig(config, timingData);
        const totalDuration = resolved.scenes.reduce(
          (sum, s) => sum + s.durationInFrames,
          0
        );
        return {
          durationInFrames: totalDuration,
          fps: resolved.meta.fps,
          width: resolved.meta.width,
          height: resolved.meta.height,
          props: { ...props, timingData },
        };
      }}
      defaultProps={{ config: defaultConfig as VideoConfig }}
    />
  );
};
