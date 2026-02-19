"use client";

import { useState } from "react";
import type { VideoConfig } from "@/engine/types";

interface ExportButtonProps {
  config: VideoConfig;
}

export function ExportButton({ config }: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  function downloadConfig() {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-config.json";
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  }

  async function copyConfig() {
    const json = JSON.stringify(config, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyRenderCommand() {
    const cmd =
      'npx remotion render src/index.ts Video out/video.mp4 --props="./video-config.json"';
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu((v) => !v)}
        className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
      >
        Export
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-zinc-700 bg-zinc-900 p-1 shadow-xl">
            <button
              onClick={downloadConfig}
              className="flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left transition-colors hover:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-100">
                Download JSON Config
              </span>
              <span className="text-xs text-zinc-500">
                Save config file, render locally with Remotion CLI
              </span>
            </button>

            <button
              onClick={copyConfig}
              className="flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left transition-colors hover:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-100">
                {copied ? "Copied!" : "Copy JSON to Clipboard"}
              </span>
              <span className="text-xs text-zinc-500">
                Paste into your own config file
              </span>
            </button>

            <div className="my-1 h-px bg-zinc-800" />

            <button
              onClick={copyRenderCommand}
              className="flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left transition-colors hover:bg-zinc-800"
            >
              <span className="text-sm font-medium text-zinc-100">
                Copy Render Command
              </span>
              <span className="font-mono text-xs text-zinc-500">
                npx remotion render ...
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
