import * as fs from "fs";
import * as path from "path";
import { MIN_VISUAL_FRAMES, DEFAULT_MIN_FRAMES } from "../src/engine/sceneConstants";
import type { VideoConfig, VoiceoverTimingData } from "../src/engine/types";

interface ElevenLabsTimestampResponse {
  audio_base64: string;
  alignment: {
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
    characters: string[];
  };
}

const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const SEPARATOR = " ... ";

async function generateWithTimestamps(
  text: string,
  voiceId: string,
  apiKey: string
): Promise<ElevenLabsTimestampResponse> {
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

/**
 * Generate voiceover audio and timing data for a video config.
 * Writes voiceover.mp3 and timing.json to the specified output directory.
 * Returns the timing data.
 */
export async function generateVoiceover(
  config: VideoConfig,
  outputDir: string
): Promise<VoiceoverTimingData> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const voiceId = config.audio?.voiceover?.voiceId ?? DEFAULT_VOICE_ID;
  const fps = config.meta?.fps ?? 30;

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Build concatenated text with character offsets
  const sceneCharOffsets: { sceneIndex: number; charStart: number; charEnd: number }[] = [];
  let fullText = "";

  for (let i = 0; i < config.scenes.length; i++) {
    const text = config.scenes[i].voiceover.trim();
    if (i > 0) fullText += SEPARATOR;
    const charStart = fullText.length;
    fullText += text;
    const charEnd = fullText.length;
    sceneCharOffsets.push({ sceneIndex: i, charStart, charEnd });
  }

  // Generate audio with timestamps
  const result = await generateWithTimestamps(fullText, voiceId, apiKey);

  // Write MP3
  const audioBuffer = Buffer.from(result.audio_base64, "base64");
  const mp3Path = path.join(outputDir, "voiceover.mp3");
  fs.writeFileSync(mp3Path, audioBuffer);

  // Compute per-scene timing
  const { character_start_times_seconds, character_end_times_seconds } = result.alignment;

  const sceneDurations: VoiceoverTimingData["sceneDurations"] = [];

  for (let i = 0; i < sceneCharOffsets.length; i++) {
    const { sceneIndex, charStart, charEnd } = sceneCharOffsets[i];
    const sceneType = config.scenes[i].type;

    const startTimeSec = character_start_times_seconds[charStart] ?? 0;
    const lastCharIdx = charEnd - 1;

    let endTimeSec: number;
    if (i < sceneCharOffsets.length - 1) {
      const nextCharStart = sceneCharOffsets[i + 1].charStart;
      endTimeSec =
        character_start_times_seconds[nextCharStart] ??
        character_end_times_seconds[lastCharIdx] ??
        0;
    } else {
      endTimeSec = character_end_times_seconds[lastCharIdx] ?? 0;
    }

    const durationSec = endTimeSec - startTimeSec;
    const rawFrames = Math.ceil(durationSec * fps);
    const minFrames = MIN_VISUAL_FRAMES[sceneType] ?? DEFAULT_MIN_FRAMES;
    const durationInFrames = Math.max(rawFrames, minFrames);

    sceneDurations.push({ sceneIndex, startTimeSec, endTimeSec, durationInFrames });
  }

  const totalDurationInFrames = sceneDurations.reduce(
    (sum, s) => sum + s.durationInFrames,
    0
  );

  const timingData: VoiceoverTimingData = {
    fps,
    sceneDurations,
    totalDurationInFrames,
  };

  // Write timing JSON
  const timingPath = path.join(outputDir, "timing.json");
  fs.writeFileSync(timingPath, JSON.stringify(timingData, null, 2));

  return timingData;
}
