import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
import { springTiming, linearTiming } from "@remotion/transitions";
import type { TransitionPresentation, TransitionTiming } from "@remotion/transitions";
import type { TransitionConfig, TransitionType } from "./types";

const DEFAULT_TRANSITION_DURATION = 15;

interface ResolvedTransition {
  presentation: TransitionPresentation<Record<string, unknown>>;
  timing: TransitionTiming;
  durationInFrames: number;
}

function resolvePresentation(
  type: TransitionType,
  width: number,
  height: number
): TransitionPresentation<Record<string, unknown>> {
  switch (type) {
    case "crossfade":
    case "fade":
      return fade() as TransitionPresentation<Record<string, unknown>>;
    case "slide":
      return slide() as TransitionPresentation<Record<string, unknown>>;
    case "wipe":
      return wipe() as TransitionPresentation<Record<string, unknown>>;
    case "clockWipe":
      return clockWipe({ width, height }) as unknown as TransitionPresentation<Record<string, unknown>>;
    case "flip":
      return flip() as TransitionPresentation<Record<string, unknown>>;
    default:
      return fade() as TransitionPresentation<Record<string, unknown>>;
  }
}

function resolveTiming(
  config: TransitionConfig,
  durationInFrames: number
): TransitionTiming {
  if (config.timing === "linear") {
    return linearTiming({ durationInFrames });
  }
  return springTiming({ durationInFrames });
}

export function getTransitionConfig(
  transition: TransitionConfig | undefined,
  width: number,
  height: number
): ResolvedTransition | null {
  if (!transition || transition.type === "none") {
    return null;
  }

  const durationInFrames = transition.durationInFrames ?? DEFAULT_TRANSITION_DURATION;

  return {
    presentation: resolvePresentation(transition.type, width, height),
    timing: resolveTiming(transition, durationInFrames),
    durationInFrames,
  };
}

export function getTransitionOverlap(
  transition: TransitionConfig | undefined
): number {
  if (!transition || transition.type === "none") {
    return 0;
  }
  return transition.durationInFrames ?? DEFAULT_TRANSITION_DURATION;
}
