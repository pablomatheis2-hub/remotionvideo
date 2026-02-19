"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { VideoConfig } from "@/engine/types";

interface RenderButtonProps {
  config: VideoConfig;
}

type RenderState =
  | { phase: "idle" }
  | { phase: "starting" }
  | { phase: "progress"; jobId: string; status: string; progress: number }
  | { phase: "done"; jobId: string }
  | { phase: "error"; message: string };

// When set, render requests go to the external render server (e.g. ngrok URL).
// When unset, falls back to relative /api/render paths (local dev).
const RENDER_BASE_URL = process.env.NEXT_PUBLIC_RENDER_API_URL
  ? process.env.NEXT_PUBLIC_RENDER_API_URL.replace(/\/+$/, "")
  : "";

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  "generating-voiceover": "Generating voiceover",
  bundling: "Bundling project",
  rendering: "Rendering video",
};

export function RenderButton({ config }: RenderButtonProps) {
  const [state, setState] = useState<RenderState>({ phase: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval>>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  async function startRender() {
    setState({ phase: "starting" });

    try {
      const res = await fetch(`${RENDER_BASE_URL}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const { jobId } = await res.json();
      setState({ phase: "progress", jobId, status: "queued", progress: 0 });

      // Start polling for status
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`${RENDER_BASE_URL}/render?jobId=${jobId}`);
          if (!statusRes.ok) return;
          const data = await statusRes.json();

          if (data.status === "done") {
            stopPolling();
            setState({ phase: "done", jobId });
          } else if (data.status === "error") {
            stopPolling();
            setState({
              phase: "error",
              message: data.error || "Render failed",
            });
          } else {
            setState({
              phase: "progress",
              jobId,
              status: data.status,
              progress: data.progress,
            });
          }
        } catch {
          // Polling error — keep trying
        }
      }, 2000);
    } catch (err) {
      setState({
        phase: "error",
        message: err instanceof Error ? err.message : "Failed to start render",
      });
    }
  }

  function handleDownload(jobId: string) {
    window.open(`${RENDER_BASE_URL}/render/download?jobId=${jobId}`, "_blank");
  }

  if (state.phase === "idle") {
    return (
      <button
        onClick={startRender}
        className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
      >
        Render Video
      </button>
    );
  }

  if (state.phase === "starting") {
    return (
      <button
        disabled
        className="rounded-lg bg-zinc-700 px-4 py-1.5 text-sm font-semibold text-zinc-300"
      >
        Starting...
      </button>
    );
  }

  if (state.phase === "progress") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-zinc-700">
            <div
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <span className="hidden text-xs text-zinc-400 sm:inline">
            {STATUS_LABELS[state.status] || state.status} ({state.progress}%)
          </span>
          <span className="text-xs text-zinc-400 sm:hidden">
            {state.progress}%
          </span>
        </div>
      </div>
    );
  }

  if (state.phase === "done") {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleDownload(state.jobId)}
          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
        >
          Download MP4
        </button>
        <button
          onClick={() => setState({ phase: "idle" })}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          New Render
        </button>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-red-400">{state.message}</span>
      <button
        onClick={() => setState({ phase: "idle" })}
        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
      >
        Retry
      </button>
    </div>
  );
}
