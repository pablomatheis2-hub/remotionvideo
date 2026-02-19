"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { validateConfig } from "@/engine/validateConfig";
import type { VideoConfig } from "@/engine/types";

interface ConfigEditorProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
}

export function ConfigEditor({ config, onConfigChange }: ConfigEditorProps) {
  const [text, setText] = useState(() => JSON.stringify(config, null, 2));
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const lastExternalConfig = useRef(config);

  // Sync textarea when config changes externally (e.g. from chat)
  useEffect(() => {
    if (config !== lastExternalConfig.current) {
      lastExternalConfig.current = config;
      const newText = JSON.stringify(config, null, 2);
      setText(newText);
      const result = validateConfig(config);
      setErrors(result.errors);
      setWarnings(result.warnings);
    }
  }, [config]);

  const handleChange = useCallback(
    (value: string) => {
      setText(value);

      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        setErrors([(e as Error).message]);
        setWarnings([]);
        return;
      }

      const result = validateConfig(parsed);
      setErrors(result.errors);
      setWarnings(result.warnings);

      if (result.errors.length === 0) {
        onConfigChange(parsed as VideoConfig);
      }
    },
    [onConfigChange]
  );

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-300">
          JSON Configuration
        </h2>
        {errors.length === 0 && (
          <span className="text-xs text-emerald-400">Valid</span>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none rounded-lg border border-zinc-700 bg-zinc-900 p-4 font-mono text-sm leading-relaxed text-zinc-100 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
      />

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3">
          <p className="mb-1 text-xs font-semibold text-red-400">Errors</p>
          <ul className="space-y-0.5 text-xs text-red-300">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-900/50 bg-yellow-950/30 p-3">
          <p className="mb-1 text-xs font-semibold text-yellow-400">Warnings</p>
          <ul className="space-y-0.5 text-xs text-yellow-300">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
