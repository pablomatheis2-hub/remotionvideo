interface Env {
  ANTHROPIC_API_KEY: string;
  ELEVENLABS_API_KEY: string | undefined;
}

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      "Missing required environment variable: ANTHROPIC_API_KEY. " +
        "Set it in your .env file or environment."
    );
  }

  cached = {
    ANTHROPIC_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || undefined,
  };

  return cached;
}
