# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Launch Remotion Studio with hot reload
npm run dev:web          # Launch Next.js web app (localhost:3000) with hot reload
npm run build            # Build Next.js app for production (Vercel runs this)
npm run build:video      # Render final video to out/video.mp4 (1920x1080, 30fps, JPEG frames)
npm run generate-voiceover                    # Generate voiceover from tinybird-config.json (default)
npx tsx scripts/generate-voiceover.ts <path>  # Generate voiceover from a specific config file
```

There are no lint or test commands configured.

## Architecture

This is a **configuration-driven video generation engine** built on Remotion 4, React 19, and TypeScript 5.9. Videos are defined entirely via JSON config files — no code changes needed for new videos.

### Core Flow

1. **JSON Config** (`VideoConfig` in `src/engine/types.ts`) defines brand, theme, audio, and an ordered array of scenes
2. **Config Resolution** (`src/engine/resolveConfig.ts`) applies defaults, validates, estimates durations, and computes adaptive theme colors
3. **Root.tsx** reads the resolved config and registers a Remotion `<Composition>` with calculated total duration (default config: `remotion-engine-config.json`)
4. **VideoComposition.tsx** sequences scenes using `@remotion/transitions` `TransitionSeries`, layering background, dot grid, scenes, voiceover audio, and background music

### Scene System

34 scene types defined as a **discriminated union** on the `type` field in `src/engine/types.ts`. Each scene type has its own component in `src/scenes/` (e.g., `Scene1_LogoReveal.tsx` for type `logoReveal`).

**Registry pattern**: `src/engine/registry.ts` maps scene `type` strings to React components. To add a new scene type:
1. Add the interface to the `SceneConfig` union in `types.ts`
2. Create the component in `src/scenes/`
3. Register it in `registry.ts`
4. Add validation rules in `validateConfig.ts`
5. Add minimum frame count in `sceneConstants.ts` (`MIN_VISUAL_FRAMES`)

### Theme System

`src/engine/ThemeContext.tsx` provides a React context with colors, fonts, gradients, and brand info. All scene components consume theme via `useTheme()`. Colors auto-adapt based on background luminance (light vs dark mode).

### Voiceover & Timing

`scripts/generate-voiceover.ts` calls ElevenLabs API (`eleven_multilingual_v2` model) with all scene voiceover texts concatenated. It produces:
- `public/voiceover/voiceover.mp3` — single audio file
- `public/voiceover/timing.json` — per-scene frame-level timing (`SceneTiming[]`)

When timing data exists, scene durations come from the audio. Otherwise, `estimateDurations.ts` estimates from word count (~2.5 words/sec) with per-scene-type minimum frames.

### Transitions

`src/engine/transitions.ts` maps `TransitionConfig` to `@remotion/transitions` presentations (crossfade, slide, wipe, clockWipe, fade, flip, none). Each scene can optionally specify a `transition` field. `getTransitionOverlap()` computes overlap frames subtracted from total duration.

### Scene Fade

`src/engine/useSceneFade.ts` provides a `useSceneFade()` hook for consistent fade-in/fade-out envelopes on scenes (configurable fadeInFrames/fadeOutFrames).

### Animation Patterns

All scenes use Remotion's `useCurrentFrame()`, `useVideoConfig()`, `spring()`, and `interpolate()`. Common patterns:
- **Stagger**: delay per item = `index * staggerDelay`
- **Fade envelope**: interpolate opacity at scene start/end (typically 15 frames)
- **Spring physics**: `spring({ frame, fps, config: { damping, stiffness } })` for natural motion
- **Float/pulse**: `Math.sin(frame * speed) * amplitude` for looping effects

### Key Types

- `VideoConfig` / `ResolvedVideoConfig` — raw vs resolved full config
- `SceneConfig` — discriminated union of all 34 scene types
- `VoiceoverTimingData` / `SceneTiming` — audio timing info
- `ThemeContextValue` — theme context shape (colors, fonts, gradients, brand)
- `TransitionConfig` / `TransitionType` — per-scene transition settings

### Web Application (Next.js)

`app/` directory contains a Next.js 16 app (App Router) with Tailwind v4 for styling. It shares `src/engine/` code directly with the Remotion project via the `@/*` path alias (maps to `./src/*`).

**Pages:**
- `/` (`app/page.tsx`) — Landing page with URL input, image upload, and JSON textarea
- `/generate` (`app/generate/page.tsx`) — Three-panel editor: chat (left), video preview (center), JSON editor (right, collapsible). Auto-scrapes URL if `?url=` param present. Reads uploaded images from `sessionStorage`.

**Key components:**
- `app/generate/_components/VideoPreview.tsx` — Wraps `@remotion/player` `<Player>`, dynamically imported with `ssr: false`
- `app/generate/_components/ChatPanel.tsx` — Chat interface for LLM-powered config generation and editing. Accepts `scrapedData` and `imageAnalysis` as context for the LLM.
- `app/generate/_components/ConfigEditor.tsx` — JSON textarea with live validation via `validateConfig()`
- `app/generate/_components/ExportButton.tsx` — Export dropdown: download JSON config, copy to clipboard, copy render command

**API routes:**
- `app/api/chat/route.ts` — Proxies chat messages to Claude API with the `prompts/generate-config.md` system prompt. Accepts optional `scrapedData` and `imageAnalysis` context. Extracts JSON config from responses. Requires `ANTHROPIC_API_KEY` in `.env`.
- `app/api/scrape/route.ts` — Server-side URL scraper using cheerio. Extracts title, meta, headings, body text, colors, features, testimonials, pricing, and brand info from HTML.
- `app/api/analyze-image/route.ts` — Sends uploaded images to Claude vision API for brand/content analysis. Accepts FormData with up to 5 images. Requires `ANTHROPIC_API_KEY`.

**Shared libraries:**
- `lib/generateVoiceover.ts` — Reusable voiceover generation via ElevenLabs API (used by local rendering pipeline)

### Rendering (local only)

Video rendering requires headless Chrome + ffmpeg and cannot run on serverless platforms. To render a video:
1. Use the web app to generate/edit a config
2. Export the JSON config via the Export button
3. Save as `remotion-engine-config.json` (or any path)
4. Run locally: `npx remotion render src/index.ts Video out/video.mp4`
5. Optionally generate voiceover first: `npm run generate-voiceover`

**TypeScript configs:**
- `tsconfig.base.json` — Shared compiler options
- `tsconfig.json` — Next.js config (bundler resolution, `@/*` path alias)
- `tsconfig.remotion.json` — Remotion-specific config (commonjs/node resolution)

### Config Files

- `remotion-engine-config.json` — active video config loaded by `Root.tsx` as default props
- `src/video-config.json` — alternate config (not currently wired to Root.tsx)
- `tinybird-config.json` — demo config (default for `generate-voiceover.ts` when no arg given)
- `prompts/generate-config.md` — LLM system prompt for generating new video configs from scraped website data
