# PRD: Video Generator Web Application

## Vision

A v0/Lovable-style web application where users input a URL or upload photos, the system scrapes/analyzes the content, an LLM generates a video configuration, and users can iteratively tweak the video through conversation before rendering and downloading.

## User Flow

```
1. User lands on the app
2. User inputs a URL or uploads photos/screenshots
3. System scrapes the URL or analyzes the images → extracts brand info, colors, copy, features, pricing, testimonials
4. Extracted data is sent to an LLM with the generate-config system prompt
5. LLM generates a VideoConfig JSON
6. User sees a video preview (Remotion Player in-browser)
7. User can chat with the LLM to tweak the video:
   - "Make it more energetic"
   - "Change the color to blue"
   - "Remove the pricing scene"
   - "Add a testimonial"
   - LLM can ask clarifying questions back
8. Each tweak regenerates the config → preview updates live
9. User clicks "Render" → server renders the video → user downloads MP4
```

## Architecture

### Layer 1: Video Engine (EXISTS)
- 34 scene types as React components
- JSON config-driven rendering via Remotion 4
- Theme system with adaptive light/dark mode
- Voiceover generation via ElevenLabs API
- Duration estimation from word count

### Layer 2: Web Application (TO BUILD)
- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Pages**:
  - `/` — Landing/input page (URL input + photo upload)
  - `/generate/[id]` — Chat interface + video preview + render/download

### Layer 3: Backend Services (TO BUILD)
- **URL Scraping**: Server action that fetches a URL, extracts text, colors, images, structured data (brand, features, pricing, testimonials)
- **Image Analysis**: Send uploaded photos to a vision model to extract brand info, colors, text, layout patterns
- **LLM Config Generation**: API route that sends scraped data + system prompt to Claude API → returns VideoConfig JSON
- **Conversational Editing**: Chat endpoint that takes current config + user message → returns updated config + explanation
- **Video Rendering**: API route that triggers `npx remotion render` server-side and returns the MP4

### Layer 4: Real-time Preview (TO BUILD)
- Embed `@remotion/player` in the browser for instant preview
- Config changes from LLM conversation update the player in real-time
- No server render needed for preview — runs client-side

## Technical Decisions

### Scraping Strategy
- Use server-side fetch + cheerio/JSDOM for HTML parsing
- Extract: page title, meta description, OG images, headings, body text, link texts, color values from CSS
- For images/screenshots: send to Claude vision API for analysis

### LLM Integration
- Use Claude API (Anthropic SDK) for config generation and conversation
- System prompt: existing `prompts/generate-config.md` (already written)
- Conversation model: send full chat history + current config on each turn
- LLM responds with updated JSON config + natural language explanation

### Rendering Pipeline
- Preview: `@remotion/player` runs in-browser (no server needed)
- Final render: server-side `npx remotion render` via Remotion's Node.js API (`@remotion/renderer`)
- Output: MP4 file served as download

### Voiceover Integration
- During preview: use estimated durations (word count fallback, already built)
- Before final render: call ElevenLabs API to generate voiceover + timing data
- Voiceover generation happens server-side as part of the render pipeline

## Implementation Phases

### Phase 1: Next.js App Shell + Remotion Player Preview
- Set up Next.js 15 alongside the existing Remotion project
- Embed `@remotion/player` for in-browser preview of existing configs
- Basic UI: paste a JSON config → see preview

### Phase 2: LLM Config Generation
- Add Claude API integration
- Chat interface: user describes a video → LLM generates config → preview renders
- Conversational editing: user tweaks via chat → config updates → preview updates

### Phase 3: URL Scraping + Image Analysis
- URL input → server-side scrape → extract structured data
- Photo upload → Claude vision analysis → extract brand info
- Feed extracted data to the LLM config generator

### Phase 4: Rendering Pipeline
- Server-side video rendering via `@remotion/renderer`
- ElevenLabs voiceover generation as part of render
- Download endpoint for the final MP4

### Phase 5: Polish
- Loading states, error handling, progress indicators
- Render queue / progress tracking
- Mobile-responsive UI
