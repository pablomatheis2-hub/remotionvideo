import type { VideoConfig, ResolvedVideoConfig, ResolvedAudioConfig, SceneConfig, VoiceoverTimingData } from "./types";
import { validateConfig } from "./validateConfig";
import { estimateSceneDurations } from "./estimateDurations";

const DEFAULT_COLORS = {
  primary: "#7c3aed",
  secondary: "#2563eb",
  accent: "#06b6d4",
  background: "#0a0a0a",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
};

function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 / 255;
}

function resolveAudio(raw: VideoConfig): ResolvedAudioConfig {
  return {
    backgroundMusic: raw.audio?.backgroundMusic
      ? {
          src: raw.audio.backgroundMusic.src,
          volume: raw.audio.backgroundMusic.volume ?? 0.3,
        }
      : null,
    voiceover: {
      voiceId: raw.audio?.voiceover?.voiceId ?? "21m00Tcm4TlvDq8ikWAM",
      volume: raw.audio?.voiceover?.volume ?? 1.0,
    },
  };
}

export function resolveConfig(
  raw: VideoConfig,
  timingData?: VoiceoverTimingData
): ResolvedVideoConfig {
  const fps = raw.meta?.fps ?? 30;

  // Validate config
  const { errors, warnings } = validateConfig(raw, fps);
  for (const w of warnings) console.warn(`\u26A0 ${w}`);
  if (errors.length > 0) {
    throw new Error(`Invalid video config:\n  - ${errors.join("\n  - ")}`);
  }

  // Determine scene durations
  let hasTimingData = false;
  let durations: number[];

  if (timingData && timingData.sceneDurations.length === raw.scenes.length) {
    // Use real durations from voiceover timing
    durations = timingData.sceneDurations.map((s) => s.durationInFrames);
    hasTimingData = true;
  } else {
    // Fallback: estimate from word count for preview
    durations = estimateSceneDurations(raw.scenes, fps);
  }

  const resolvedScenes = raw.scenes.map((scene, i) => ({
    ...scene,
    durationInFrames: durations[i],
  })) as SceneConfig[];

  const c = { ...DEFAULT_COLORS, ...raw.theme?.colors };
  const isLight = luminance(c.background) > 0.5;

  const colors = {
    ...c,
    cardBg: isLight ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.05)",
    cardBorder: isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)",
    cardShadow: isLight
      ? "0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.06)"
      : "0 8px 32px rgba(0,0,0,0.3)",
    gridLine: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
    white: "#ffffff",
  };

  const fonts = {
    family: raw.theme?.fonts?.family ?? "Inter",
    weights: raw.theme?.fonts?.weights ?? ["400", "500", "700", "800", "900"],
  };

  const gradients = {
    accent: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
    accentText: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
  };

  return {
    meta: {
      fps,
      width: raw.meta?.width ?? 1920,
      height: raw.meta?.height ?? 1080,
    },
    brand: {
      name: raw.brand.name,
      tagline: raw.brand.tagline ?? "",
      logoUrl: raw.brand.logoUrl ?? "",
    },
    theme: { colors, fonts, gradients },
    audio: resolveAudio(raw),
    scenes: resolvedScenes,
    hasTimingData,
  };
}
