"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [json, setJson] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleGenerate() {
    // If images were uploaded, store in sessionStorage and navigate
    if (files.length > 0) {
      const promises = files.map(
        (f) =>
          new Promise<{ name: string; type: string; data: string }>(
            (resolve) => {
              const reader = new FileReader();
              reader.onload = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve({ name: f.name, type: f.type, data: base64 });
              };
              reader.readAsDataURL(f);
            }
          )
      );

      Promise.all(promises).then((images) => {
        sessionStorage.setItem("uploadedImages", JSON.stringify(images));
        router.push("/generate");
      });
      return;
    }

    const params = new URLSearchParams();
    if (url.trim()) params.set("url", url.trim());
    if (json.trim()) params.set("json", json.trim());
    const qs = params.toString();
    router.push(`/generate${qs ? `?${qs}` : ""}`);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (selected) {
      setFiles(Array.from(selected).slice(0, 5));
    }
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 sm:gap-8 sm:p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Remotion Video Engine
        </h1>
        <p className="mt-3 text-base text-zinc-400 sm:text-lg">
          Generate professional videos from a URL, photos, or JSON
          configuration.
        </p>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-4">
        {/* URL Input */}
        <div>
          <label
            htmlFor="url-input"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            Website URL
          </label>
          <input
            id="url-input"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-500">or upload images</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Screenshots / Photos
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-6 transition-colors hover:border-zinc-500"
          >
            <span className="text-sm text-zinc-400">
              Click to upload images (max 5)
            </span>
            <span className="text-xs text-zinc-500">
              PNG, JPG, or WebP
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300"
                >
                  {f.name}
                  <button
                    onClick={() => removeFile(i)}
                    className="text-zinc-500 hover:text-zinc-200"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-zinc-800" />
          <span className="text-xs text-zinc-500">or paste JSON config</span>
          <div className="h-px flex-1 bg-zinc-800" />
        </div>

        {/* JSON Input */}
        <div>
          <label
            htmlFor="json-input"
            className="mb-1.5 block text-sm font-medium text-zinc-300"
          >
            JSON Configuration
          </label>
          <textarea
            id="json-input"
            rows={6}
            placeholder='{"brand": {"name": "My Brand"}, "scenes": [...]}'
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 font-mono text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="mt-2 rounded-lg bg-white px-6 py-2.5 font-semibold text-zinc-950 transition-colors hover:bg-zinc-200"
        >
          Generate Video
        </button>
      </div>
    </div>
  );
}
