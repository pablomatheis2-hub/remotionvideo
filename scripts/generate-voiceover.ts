import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

interface Scene {
  type: string;
  voiceover: string;
  [key: string]: unknown;
}

interface Config {
  meta?: { fps?: number };
  audio?: {
    voiceover?: { voiceId?: string };
  };
  scenes: Scene[];
}

interface ElevenLabsTimestampResponse {
  audio_base64: string;
  alignment: {
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
    characters: string[];
  };
}

// Minimum visual frames per scene type (must match estimateDurations.ts)
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
};

const DEFAULT_MIN_FRAMES = 60;
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel
const SEPARATOR = " ... ";

async function generateWithTimestamps(
  text: string,
  voiceId: string
): Promise<ElevenLabsTimestampResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY not found in environment. Create a .env file with ELEVENLABS_API_KEY=your_key"
    );
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `ElevenLabs API error (${response.status}): ${errorText}`
    );
  }

  return (await response.json()) as ElevenLabsTimestampResponse;
}

async function main(): Promise<void> {
  const configPath = process.argv[2] || "tinybird-config.json";
  const resolvedPath = path.resolve(configPath);

  console.log(`Reading config from: ${resolvedPath}`);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Config file not found: ${resolvedPath}`);
    process.exit(1);
  }

  const config: Config = JSON.parse(fs.readFileSync(resolvedPath, "utf-8"));
  const voiceId = config.audio?.voiceover?.voiceId ?? DEFAULT_VOICE_ID;
  const fps = config.meta?.fps ?? 30;

  // Validate all scenes have voiceover
  for (let i = 0; i < config.scenes.length; i++) {
    if (!config.scenes[i].voiceover) {
      console.error(`Scene ${i} (${config.scenes[i].type}): missing voiceover text`);
      process.exit(1);
    }
  }

  const outputDir = path.resolve("public/voiceover");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clean up old scene-*.mp3 files
  const oldFiles = fs.readdirSync(outputDir).filter((f) => /^scene-\d+\.mp3$/.test(f));
  for (const f of oldFiles) {
    fs.unlinkSync(path.join(outputDir, f));
    console.log(`Cleaned up old file: ${f}`);
  }

  // Build concatenated text and track character offsets per scene
  const sceneCharOffsets: { sceneIndex: number; charStart: number; charEnd: number }[] = [];
  let fullText = "";

  for (let i = 0; i < config.scenes.length; i++) {
    const text = config.scenes[i].voiceover.trim();
    if (i > 0) {
      fullText += SEPARATOR;
    }
    const charStart = fullText.length;
    fullText += text;
    const charEnd = fullText.length;
    sceneCharOffsets.push({ sceneIndex: i, charStart, charEnd });
  }

  console.log(`\nConcatenated voiceover text (${fullText.length} chars):`);
  console.log(`  "${fullText.substring(0, 120)}${fullText.length > 120 ? "..." : ""}"\n`);
  console.log(`Using voice ID: ${voiceId}`);
  console.log(`Generating single voiceover with timestamps...\n`);

  // Single API call with timestamps
  const result = await generateWithTimestamps(fullText, voiceId);

  // Write the MP3 file
  const audioBuffer = Buffer.from(result.audio_base64, "base64");
  const mp3Path = path.join(outputDir, "voiceover.mp3");
  fs.writeFileSync(mp3Path, audioBuffer);
  console.log(`Saved: ${mp3Path} (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

  // Compute per-scene timing from character timestamps
  const { character_start_times_seconds, character_end_times_seconds } = result.alignment;

  const sceneDurations: {
    sceneIndex: number;
    startTimeSec: number;
    endTimeSec: number;
    durationInFrames: number;
  }[] = [];

  for (let i = 0; i < sceneCharOffsets.length; i++) {
    const { sceneIndex, charStart, charEnd } = sceneCharOffsets[i];
    const sceneType = config.scenes[i].type;

    // Find the start time: first character of this scene's text
    const startTimeSec = character_start_times_seconds[charStart] ?? 0;

    // Find the end time: last character of this scene's text
    // Use end time of last char (charEnd - 1)
    const lastCharIdx = charEnd - 1;
    let endTimeSec: number;

    if (i < sceneCharOffsets.length - 1) {
      // For non-last scenes, end at the start of the next scene's first character
      // This captures the separator pause as part of the preceding scene
      const nextCharStart = sceneCharOffsets[i + 1].charStart;
      endTimeSec = character_start_times_seconds[nextCharStart] ?? character_end_times_seconds[lastCharIdx] ?? 0;
    } else {
      // Last scene: use the end time of its last character
      endTimeSec = character_end_times_seconds[lastCharIdx] ?? 0;
    }

    const durationSec = endTimeSec - startTimeSec;
    const rawFrames = Math.ceil(durationSec * fps);
    const minFrames = MIN_VISUAL_FRAMES[sceneType] ?? DEFAULT_MIN_FRAMES;
    const durationInFrames = Math.max(rawFrames, minFrames);

    sceneDurations.push({
      sceneIndex,
      startTimeSec,
      endTimeSec,
      durationInFrames,
    });

    console.log(
      `  Scene ${sceneIndex} (${sceneType}): ${startTimeSec.toFixed(2)}s - ${endTimeSec.toFixed(2)}s → ${durationInFrames} frames (${(durationInFrames / fps).toFixed(1)}s)`
    );
  }

  const totalDurationInFrames = sceneDurations.reduce(
    (sum, s) => sum + s.durationInFrames,
    0
  );

  const timingData = {
    fps,
    sceneDurations,
    totalDurationInFrames,
  };

  const timingPath = path.join(outputDir, "timing.json");
  fs.writeFileSync(timingPath, JSON.stringify(timingData, null, 2));
  console.log(`\nSaved: ${timingPath}`);
  console.log(
    `\nTotal duration: ${totalDurationInFrames} frames (${(totalDurationInFrames / fps).toFixed(1)}s)`
  );
  console.log("\nDone! Voiceover and timing data generated successfully.");
}

main();
