"use client";

import { Player } from "@remotion/player";
import { VideoComposition } from "@/engine/VideoComposition";
import { resolveConfig } from "@/engine/resolveConfig";
import { getTransitionOverlap } from "@/engine/transitions";
import type { VideoConfig } from "@/engine/types";

interface VideoPreviewProps {
  config: VideoConfig;
}

export function VideoPreview({ config }: VideoPreviewProps) {
  let resolved;
  let errorMessage = "";
  try {
    resolved = resolveConfig(config);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Invalid configuration";
  }

  if (!resolved) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900">
        <span className="text-sm font-medium text-zinc-400">
          Cannot preview
        </span>
        <span className="max-w-md px-4 text-center text-xs text-zinc-500">
          {errorMessage}
        </span>
      </div>
    );
  }

  const sceneDurationSum = resolved.scenes.reduce(
    (sum, s) => sum + s.durationInFrames,
    0
  );
  const transitionOverlapSum = resolved.scenes
    .slice(0, -1)
    .reduce((sum, s) => sum + getTransitionOverlap(s.transition), 0);
  const totalDuration = sceneDurationSum - transitionOverlapSum;

  if (totalDuration <= 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900">
        <span className="text-sm text-zinc-500">No scenes to preview</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg">
      <Player
        component={VideoComposition}
        inputProps={{ config }}
        durationInFrames={totalDuration}
        fps={resolved.meta.fps}
        compositionWidth={resolved.meta.width}
        compositionHeight={resolved.meta.height}
        style={{ width: "100%" }}
        controls
        autoPlay
        loop
      />
    </div>
  );
}
