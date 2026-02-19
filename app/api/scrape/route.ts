import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export interface ScrapedData {
  url: string;
  title: string;
  metaDescription: string;
  ogImage: string;
  headings: string[];
  bodyText: string;
  links: { text: string; href: string }[];
  colors: string[];
  features: string[];
  testimonials: { quote: string; author: string }[];
  pricing: { tier: string; price: string; features: string[] }[];
  companyName: string;
  tagline: string;
}

const HEX_REGEX = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
const RGB_REGEX = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;

function extractColors(html: string): string[] {
  const colors = new Set<string>();
  const hexMatches = html.match(HEX_REGEX) || [];
  for (const c of hexMatches) {
    // Skip very common non-brand colors
    const lower = c.toLowerCase();
    if (
      lower !== "#fff" &&
      lower !== "#ffffff" &&
      lower !== "#000" &&
      lower !== "#000000" &&
      lower !== "#333" &&
      lower !== "#333333" &&
      lower !== "#666" &&
      lower !== "#666666" &&
      lower !== "#999" &&
      lower !== "#999999" &&
      lower !== "#ccc" &&
      lower !== "#cccccc"
    ) {
      colors.add(lower);
    }
  }
  const rgbMatches = html.match(RGB_REGEX) || [];
  for (const c of rgbMatches) {
    colors.add(c);
  }
  return [...colors].slice(0, 10);
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body as { url: string };

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!parsedUrl.protocol.startsWith("http")) {
      throw new Error("Must be HTTP(S)");
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RemotionVideoBot/1.0; +https://remotion.dev)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts/styles from content extraction
    $("script, style, noscript, svg, iframe").remove();

    // Basic metadata
    const title = $("title").first().text().trim();
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";
    const ogImage =
      $('meta[property="og:image"]').attr("content")?.trim() || "";

    // Headings
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length < 200) {
        headings.push(text);
      }
    });

    // Body text — grab paragraphs, list items, etc.
    const bodyParts: string[] = [];
    $("p, li, td, blockquote").each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10 && text.length < 500) {
        bodyParts.push(text);
      }
    });
    const bodyText = truncate(bodyParts.join("\n"), 4000);

    // Links with text
    const links: { text: string; href: string }[] = [];
    $("a[href]").each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (text && text.length > 1 && text.length < 100 && href) {
        links.push({ text, href });
      }
    });

    // Colors from inline styles and style blocks
    const colors = extractColors(html);

    // Try to extract features (common patterns)
    const features: string[] = [];
    $(
      '[class*="feature"] h3, [class*="feature"] h4, [class*="benefit"] h3, [class*="benefit"] h4'
    ).each((_, el) => {
      const text = $(el).text().trim();
      if (text) features.push(text);
    });
    // Fallback: look for lists in feature-like sections
    if (features.length === 0) {
      $(
        '[class*="feature"] li, [class*="benefit"] li, [class*="Feature"] li'
      ).each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length < 200) features.push(text);
      });
    }

    // Try to extract testimonials
    const testimonials: { quote: string; author: string }[] = [];
    $(
      '[class*="testimonial"], [class*="review"], [class*="quote"], blockquote'
    ).each((_, el) => {
      const quoteText = $(el).find("p, q, .quote-text, blockquote").first().text().trim() ||
        $(el).text().trim();
      const author =
        $(el).find('[class*="author"], [class*="name"], cite, figcaption').first().text().trim() ||
        "";
      if (quoteText && quoteText.length > 20 && quoteText.length < 500) {
        testimonials.push({
          quote: truncate(quoteText, 300),
          author: truncate(author, 100),
        });
      }
    });

    // Try to extract pricing
    const pricing: { tier: string; price: string; features: string[] }[] = [];
    $('[class*="pricing"], [class*="plan"], [class*="tier"]').each((_, el) => {
      const tier =
        $(el).find("h2, h3, h4, [class*='name'], [class*='title']").first().text().trim() || "";
      const price =
        $(el).find("[class*='price'], [class*='amount']").first().text().trim() || "";
      const tierFeatures: string[] = [];
      $(el)
        .find("li")
        .each((__, li) => {
          const t = $(li).text().trim();
          if (t) tierFeatures.push(t);
        });
      if (tier || price) {
        pricing.push({
          tier: truncate(tier, 100),
          price: truncate(price, 50),
          features: tierFeatures.slice(0, 10),
        });
      }
    });

    // Company name heuristic
    const companyName =
      $('meta[property="og:site_name"]').attr("content")?.trim() ||
      $('[class*="logo"] img').attr("alt")?.trim() ||
      title.split(/[|\-–—]/).map((s) => s.trim())[0] ||
      parsedUrl.hostname.replace("www.", "").split(".")[0];

    // Tagline heuristic
    const tagline =
      $("h1").first().text().trim() ||
      metaDescription.split(".")[0] ||
      "";

    const data: ScrapedData = {
      url: parsedUrl.toString(),
      title,
      metaDescription: truncate(metaDescription, 500),
      ogImage,
      headings: headings.slice(0, 20),
      bodyText,
      links: links.slice(0, 30),
      colors,
      features: features.slice(0, 15),
      testimonials: testimonials.slice(0, 5),
      pricing: pricing.slice(0, 4),
      companyName: truncate(companyName, 100),
      tagline: truncate(tagline, 200),
    };

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Scraping failed: ${message}` },
      { status: 500 }
    );
  }
}
