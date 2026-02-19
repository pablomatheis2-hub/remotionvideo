const VALID_TRANSITION_TYPES = new Set([
  "crossfade",
  "slide",
  "wipe",
  "clockWipe",
  "fade",
  "flip",
  "none",
]);

// ── Known scene types and their required fields ──

const VALID_SCENE_TYPES = new Set([
  "logoReveal",
  "kineticText",
  "heroTagline",
  "featureCards",
  "frameworks",
  "codeDemo",
  "globe",
  "stats",
  "socialProof",
  "cta",
  "timeline",
  "testimonial",
  "comparison",
  "metricChart",
  "checklist",
  "splitImage",
  "iconGrid",
  "pricingTable",
  "quoteCarousel",
  "impactWord",
  "countdownReveal",
  "typewriter",
  "logoWall",
  "barChart",
  "numberedSteps",
  "fullscreenQuote",
  "donutChart",
  "teamGrid",
  "textMarquee",
  "splitReveal",
  "browserMockup",
  "wordCloud",
  "gradientWave",
  "stackReveal",
]);

const REQUIRED_FIELDS: Record<string, string[]> = {
  kineticText: ["words"],
  heroTagline: ["headline", "subtitle"],
  featureCards: ["title", "features"],
  frameworks: ["title", "items"],
  codeDemo: ["command", "successMessage", "details"],
  globe: ["headline"],
  stats: ["stats"],
  socialProof: ["headline", "count", "companies"],
  cta: ["headline", "buttonText"],
  timeline: ["title", "steps"],
  testimonial: ["quote", "author"],
  comparison: ["before", "after"],
  metricChart: ["title", "metrics"],
  checklist: ["title", "items"],
  splitImage: ["title", "image"],
  iconGrid: ["title", "icons"],
  pricingTable: ["tiers"],
  quoteCarousel: ["quotes"],
  impactWord: ["word"],
  countdownReveal: ["headline"],
  typewriter: ["text"],
  logoWall: ["logos"],
  barChart: ["title", "bars"],
  numberedSteps: ["steps"],
  fullscreenQuote: ["quote"],
  donutChart: ["title", "segments"],
  teamGrid: ["members"],
  textMarquee: ["words"],
  splitReveal: ["headline"],
  browserMockup: ["url", "title", "features"],
  wordCloud: ["words"],
  gradientWave: ["headline"],
  stackReveal: ["cards"],
};

// ── Validate config ──

export function validateConfig(
  raw: unknown,
  fps = 30
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== "object") {
    errors.push("Config must be a JSON object");
    return { errors, warnings };
  }

  const config = raw as Record<string, unknown>;

  // Brand validation
  if (!config.brand || typeof config.brand !== "object") {
    errors.push("Missing required field: brand");
  } else {
    const brand = config.brand as Record<string, unknown>;
    if (!brand.name || typeof brand.name !== "string") {
      errors.push("Missing required field: brand.name");
    }
  }

  // Scenes validation
  if (!Array.isArray(config.scenes)) {
    errors.push("Missing required field: scenes (must be an array)");
    return { errors, warnings };
  }

  if (config.scenes.length === 0) {
    errors.push("scenes array must not be empty");
    return { errors, warnings };
  }

  for (let i = 0; i < config.scenes.length; i++) {
    const scene = config.scenes[i] as Record<string, unknown>;
    const sceneLabel = `Scene ${i}`;

    // Type check
    if (!scene.type || typeof scene.type !== "string") {
      errors.push(`${sceneLabel}: missing "type" field`);
      continue;
    }

    if (!VALID_SCENE_TYPES.has(scene.type)) {
      errors.push(
        `${sceneLabel}: unknown scene type "${scene.type}". Valid types: ${[...VALID_SCENE_TYPES].join(", ")}`
      );
      continue;
    }

    // Voiceover required check
    if (!scene.voiceover || typeof scene.voiceover !== "string") {
      errors.push(`${sceneLabel} (${scene.type}): missing required "voiceover" field`);
    } else {
      // Warn if voiceover text is very long (~8+ seconds at 2.5 words/sec)
      const words = scene.voiceover.trim().split(/\s+/).length;
      if (words > 20) {
        warnings.push(
          `${sceneLabel} (${scene.type}): voiceover has ${words} words (~${(words / 2.5).toFixed(1)}s). Consider splitting into shorter scenes.`
        );
      }
    }

    // Required fields
    const required = REQUIRED_FIELDS[scene.type] ?? [];
    for (const field of required) {
      if (scene[field] === undefined || scene[field] === null) {
        errors.push(`${sceneLabel} (${scene.type}): missing required field "${field}"`);
      }
    }

    // Transition validation
    if (scene.transition && typeof scene.transition === "object") {
      const transition = scene.transition as Record<string, unknown>;
      if (transition.type && typeof transition.type === "string") {
        if (!VALID_TRANSITION_TYPES.has(transition.type)) {
          warnings.push(
            `${sceneLabel} (${scene.type}): unknown transition type "${transition.type}". Valid types: ${[...VALID_TRANSITION_TYPES].join(", ")}`
          );
        }
      }
    }
  }

  return { errors, warnings };
}
