import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), "prompts/generate-config.md"),
  "utf-8"
);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  currentConfig?: unknown;
  scrapedData?: unknown;
  imageAnalysis?: unknown;
}

function buildSystemPrompt(
  currentConfig?: unknown,
  scrapedData?: unknown,
  imageAnalysis?: unknown
): string {
  let prompt = SYSTEM_PROMPT;

  if (scrapedData) {
    prompt += `

---

## Scraped Website Data

The user provided a URL and the following data was extracted from the website. Use this data to generate a video config that accurately represents the brand, features, colors, and content found on the website.

\`\`\`json
${JSON.stringify(scrapedData, null, 2)}
\`\`\``;
  }

  if (imageAnalysis) {
    prompt += `

---

## Image Analysis Data

The user uploaded images/screenshots and the following data was extracted. Use this data to generate a video config that matches the brand, style, and content visible in the images.

\`\`\`json
${JSON.stringify(imageAnalysis, null, 2)}
\`\`\``;
  }

  if (currentConfig) {
    prompt += `

---

## Current Video Config

The user already has a video config. They want to modify it. Here is the current config:

\`\`\`json
${JSON.stringify(currentConfig, null, 2)}
\`\`\`

The user will describe changes they want. Return the COMPLETE updated JSON config with those changes applied. Do not return partial configs or diffs — always return the full config.`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as ChatRequest;
  const { messages, currentConfig, scrapedData, imageAnalysis } = body;

  if (!messages || messages.length === 0) {
    return NextResponse.json(
      { error: "messages array is required" },
      { status: 400 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: buildSystemPrompt(currentConfig, scrapedData, imageAnalysis),
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock ? textBlock.text : "";

    // Try to extract JSON from the response
    let config: unknown = null;
    let explanation = text;

    // The LLM might return pure JSON or JSON embedded in explanation
    // Try to parse the whole response as JSON first
    try {
      config = JSON.parse(text);
      explanation = "";
    } catch {
      // Look for a JSON block in the response
      const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        try {
          config = JSON.parse(jsonMatch[1]);
          explanation = text
            .replace(/```(?:json)?\s*\n?[\s\S]*?\n?```/, "")
            .trim();
        } catch {
          // JSON in code block wasn't valid
        }
      }

      // Try to find raw JSON object in text
      if (!config) {
        const braceMatch = text.match(/\{[\s\S]*\}/);
        if (braceMatch) {
          try {
            config = JSON.parse(braceMatch[0]);
            explanation = text.replace(braceMatch[0], "").trim();
          } catch {
            // Not valid JSON
          }
        }
      }
    }

    return NextResponse.json({
      config,
      explanation,
      raw: text,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
