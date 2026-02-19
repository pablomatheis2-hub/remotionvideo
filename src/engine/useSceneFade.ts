import { useCurrentFrame, interpolate } from "remotion";

interface UseSceneFadeOptions {
  durationInFrames: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  combine?: "min" | "multiply";
}

export function useSceneFade({
  durationInFrames,
  fadeInFrames = 12,
  fadeOutFrames = 15,
  combine = "min",
}: UseSceneFadeOptions): number {
  const frame = useCurrentFrame();

  const opacityIn =
    fadeInFrames > 0
      ? interpolate(frame, [0, fadeInFrames], [0, 1], {
          extrapolateRight: "clamp",
        })
      : 1;

  const opacityOut =
    fadeOutFrames > 0
      ? interpolate(
          frame,
          [durationInFrames - fadeOutFrames, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        )
      : 1;

  return combine === "min"
    ? Math.min(opacityIn, opacityOut)
    : opacityIn * opacityOut;
}
