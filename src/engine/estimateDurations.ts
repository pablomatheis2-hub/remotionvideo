import type { RawSceneConfig } from "./types";
import { MIN_VISUAL_FRAMES, DEFAULT_MIN_FRAMES } from "./sceneConstants";

export function estimateSceneDurations(
  scenes: RawSceneConfig[],
  fps: number
): number[] {
  return scenes.map((scene) => {
    const wordCount = scene.voiceover.trim().split(/\s+/).length;
    const estimatedSeconds = wordCount / 2.5;
    const estimatedFrames = Math.ceil(estimatedSeconds * fps);
    const minFrames = MIN_VISUAL_FRAMES[scene.type] ?? DEFAULT_MIN_FRAMES;
    return Math.max(estimatedFrames, minFrames);
  });
}

export { MIN_VISUAL_FRAMES };
