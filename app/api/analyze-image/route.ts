import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const ANALYSIS_PROMPT = `Analyze this image/screenshot and extract the following information for creating a promotional video. Return a JSON object with these fields:

{
  "companyName": "string — brand/company name visible",
  "tagline": "string — main headline or tagline",
  "description": "string — what the product/service does",
  "features": ["string — key features or benefits mentioned"],
  "colors": {
    "primary": "#hex — main brand color",
    "secondary": "#hex — secondary color",
    "accent": "#hex — accent/CTA color",
    "background": "#hex — suggested background (#0a0a0a for dark, #ffffff for light)",
    "textPrimary": "#hex — main text color",
    "textSecondary": "#hex — secondary text color"
  },
  "testimonials": [{"quote": "string", "author": "string"}],
  "pricing": [{"tier": "string", "price": "string", "features": ["string"]}],
  "style": "string — overall visual style (modern, playful, corporate, minimal, etc.)"
}

Only include fields where you can extract meaningful data. Return ONLY the JSON, no explanation.`;

type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Convert files to base64
    const imageContents: Anthropic.ImageBlockParam[] = [];
    for (const file of files.slice(0, 5)) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");

      let mediaType: ImageMediaType = "image/png";
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        mediaType = "image/jpeg";
      } else if (file.type === "image/png") {
        mediaType = "image/png";
      } else if (file.type === "image/gif") {
        mediaType = "image/gif";
      } else if (file.type === "image/webp") {
        mediaType = "image/webp";
      }

      imageContents.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
    }

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            ...imageContents,
            { type: "text", text: ANALYSIS_PROMPT },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text = textBlock ? textBlock.text : "";

    let analysis: unknown = null;
    try {
      analysis = JSON.parse(text);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch {
          // Fall through
        }
      }
    }

    return NextResponse.json({ analysis, raw: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
