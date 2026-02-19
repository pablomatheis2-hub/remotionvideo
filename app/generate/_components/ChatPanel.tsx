"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { VideoConfig } from "@/engine/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  config: VideoConfig | null;
  onConfigGenerated: (config: VideoConfig) => void;
  initialPrompt?: string;
  scrapedData?: unknown;
  imageAnalysis?: unknown;
}

export function ChatPanel({
  config,
  onConfigGenerated,
  initialPrompt,
  scrapedData,
  imageAnalysis,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      setError(null);

      const userMessage: ChatMessage = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages,
            currentConfig: config,
            scrapedData,
            imageAnalysis,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();

        let assistantContent = "";
        if (data.explanation) {
          assistantContent = data.explanation;
        }
        if (data.config && !data.explanation) {
          assistantContent = "Here's the generated video configuration.";
        }
        if (!data.config && !data.explanation) {
          assistantContent = data.raw || "No response generated.";
        }

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: assistantContent,
        };
        setMessages([...updatedMessages, assistantMessage]);

        if (data.config) {
          onConfigGenerated(data.config as VideoConfig);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [config, loading, messages, onConfigGenerated, scrapedData, imageAnalysis]
  );

  // Auto-send initial prompt when scraped data or image analysis arrives
  useEffect(() => {
    if (
      initialPrompt &&
      !autoSentRef.current &&
      (scrapedData || imageAnalysis || initialPrompt)
    ) {
      // Only auto-send if we have context data, otherwise just populate input
      if (scrapedData || imageAnalysis) {
        autoSentRef.current = true;
        sendMessage(initialPrompt);
      } else {
        setInput(initialPrompt);
      }
    }
  }, [initialPrompt, scrapedData, imageAnalysis, sendMessage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-zinc-400">
              Describe the video you want to create, or ask for changes to the
              current config.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Create a promo video for a SaaS analytics tool",
                "Make it more energetic",
                "Change the color scheme to blue",
                "Add a testimonial scene",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${msg.role === "user" ? "flex justify-end" : ""}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800/50 text-zinc-300"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4">
            <div className="inline-block rounded-lg bg-zinc-800/50 px-3.5 py-2.5 text-sm text-zinc-400">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">Generating</span>
                <span className="animate-bounce">...</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-900/50 bg-red-950/30 px-3.5 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-800 p-4">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your video or request changes..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="self-end rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
