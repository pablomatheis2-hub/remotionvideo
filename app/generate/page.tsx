"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChatPanel } from "./_components/ChatPanel";
import { ConfigEditor } from "./_components/ConfigEditor";
import { ExportButton } from "./_components/ExportButton";
import { RenderButton } from "./_components/RenderButton";
import { validateConfig } from "@/engine/validateConfig";
import type { VideoConfig } from "@/engine/types";
import defaultConfig from "../../remotion-engine-config.json";

const VideoPreview = dynamic(
  () =>
    import("./_components/VideoPreview").then((mod) => ({
      default: mod.VideoPreview,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900">
        <span className="animate-pulse text-sm text-zinc-500">
          Loading preview...
        </span>
      </div>
    ),
  }
);

type MobileTab = "chat" | "preview" | "json";

function GenerateContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<VideoConfig>(
    defaultConfig as VideoConfig
  );
  const [showConfig, setShowConfig] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>();
  const [scrapedData, setScrapedData] = useState<unknown>(undefined);
  const [imageAnalysis, setImageAnalysis] = useState<unknown>(undefined);
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Process query params on mount
  useEffect(() => {
    const jsonParam = searchParams.get("json");
    const urlParam = searchParams.get("url");

    if (jsonParam) {
      try {
        const parsed = JSON.parse(jsonParam);
        const { errors } = validateConfig(parsed);
        if (errors.length === 0) {
          setConfig(parsed as VideoConfig);
        }
      } catch {
        // Invalid JSON — ignore
      }
    }

    if (urlParam) {
      setInitialPrompt(
        `Create a promotional video for this website: ${urlParam}`
      );
      setScraping(true);
      fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlParam }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setScrapedData(data);
        })
        .catch((err) => {
          setScrapeError(
            err instanceof Error ? err.message : "Scraping failed"
          );
        })
        .finally(() => {
          setScraping(false);
        });
    }
  }, [searchParams]);

  // Handle image files passed via sessionStorage
  useEffect(() => {
    const storedImages = sessionStorage.getItem("uploadedImages");
    if (!storedImages) return;
    sessionStorage.removeItem("uploadedImages");

    const images: { name: string; type: string; data: string }[] =
      JSON.parse(storedImages);
    if (images.length === 0) return;

    const formData = new FormData();
    for (const img of images) {
      const byteString = atob(img.data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      formData.append("images", new Blob([ab], { type: img.type }), img.name);
    }

    setScraping(true);
    setInitialPrompt(
      "Create a promotional video based on the uploaded images."
    );

    fetch("/api/analyze-image", { method: "POST", body: formData })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.analysis) {
          setImageAnalysis(data.analysis);
        }
      })
      .catch((err) => {
        setScrapeError(
          err instanceof Error ? err.message : "Image analysis failed"
        );
      })
      .finally(() => {
        setScraping(false);
      });
  }, []);

  const handleConfigChange = useCallback((newConfig: VideoConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold text-zinc-300 hover:text-white"
        >
          Remotion Video Engine
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <RenderButton config={config} />
          <ExportButton config={config} />
          <button
            onClick={() => setShowConfig((v) => !v)}
            className="hidden rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200 lg:block"
          >
            {showConfig ? "Hide JSON" : "Show JSON"}
          </button>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="flex border-b border-zinc-800 lg:hidden">
        {(["chat", "preview", "json"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 px-4 py-2 text-xs font-medium capitalize transition-colors ${
              mobileTab === tab
                ? "border-b-2 border-white text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Desktop: side-by-side layout / Mobile: tabbed */}
      <div className="flex min-h-0 flex-1">
        {/* Chat panel */}
        <div
          className={`flex flex-col border-r border-zinc-800 ${
            mobileTab === "chat" ? "flex" : "hidden"
          } w-full lg:flex lg:w-[380px] lg:shrink-0`}
        >
          {scraping && (
            <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs text-zinc-400">
              <span className="animate-pulse">Analyzing content...</span>
            </div>
          )}
          {scrapeError && (
            <div className="border-b border-red-900/50 bg-red-950/30 px-4 py-2.5 text-xs text-red-300">
              {scrapeError}
            </div>
          )}
          <ChatPanel
            config={config}
            onConfigGenerated={handleConfigChange}
            initialPrompt={initialPrompt}
            scrapedData={scrapedData}
            imageAnalysis={imageAnalysis}
          />
        </div>

        {/* Video preview */}
        <div
          className={`flex flex-1 flex-col items-center justify-center bg-zinc-950 p-4 sm:p-6 ${
            mobileTab === "preview" ? "flex" : "hidden"
          } lg:flex`}
        >
          <div className="w-full max-w-4xl">
            <VideoPreview config={config} />
          </div>
        </div>

        {/* Config editor — mobile: JSON tab / desktop: collapsible panel */}
        {(mobileTab === "json" || showConfig) && (
          <div
            className={`w-full flex-col border-l border-zinc-800 p-4 lg:w-[420px] lg:shrink-0 ${
              mobileTab === "json" ? "flex" : "hidden"
            } ${showConfig ? "lg:flex" : "lg:hidden"}`}
          >
            <ConfigEditor
              config={config}
              onConfigChange={handleConfigChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense>
      <GenerateContent />
    </Suspense>
  );
}
