import type { RawSceneConfig } from "./types";

// Minimum visual frames per scene type (animation minimums at 30fps)
const MIN_VISUAL_FRAMES: Record<string, number> = {
  logoReveal: 60,
  kineticText: 45,
  heroTagline: 60,
  featureCards: 75,
  frameworks: 60,
  codeDemo: 90,
  globe: 60,
  stats: 75,
  socialProof: 60,
  cta: 60,
  timeline: 75,
  testimonial: 75,
  comparison: 75,
  metricChart: 75,
  checklist: 60,
  splitImage: 60,
  iconGrid: 60,
  pricingTable: 90,
  quoteCarousel: 90,
  impactWord: 45,
  countdownReveal: 90,
  typewriter: 75,
  logoWall: 75,
  barChart: 75,
  numberedSteps: 75,
  fullscreenQuote: 75,
  donutChart: 90,
  teamGrid: 75,
  textMarquee: 60,
  splitReveal: 60,
  browserMockup: 90,
  wordCloud: 75,
  gradientWave: 60,
  stackReveal: 75,
};

const DEFAULT_MIN_FRAMES = 60;

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
