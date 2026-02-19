import "dotenv/config";
import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { spawn } from "node:child_process";
import { validateConfig } from "../src/engine/validateConfig";
import { createJob, getJob, updateJob, cleanupOldJobs } from "../lib/renderJobs";
import { generateVoiceover } from "../lib/generateVoiceover";
import type { VideoConfig } from "../src/engine/types";

const PORT = parseInt(process.env.PORT || "3001", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
const RENDERS_DIR = path.join(process.cwd(), "renders");

let activeRender = false;

function ensureRendersDir() {
  if (!fs.existsSync(RENDERS_DIR)) {
    fs.mkdirSync(RENDERS_DIR, { recursive: true });
  }
}

function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  setCorsHeaders(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

async function runRenderPipeline(jobId: string, config: VideoConfig) {
  activeRender = true;

  try {
    // Step 1: Generate voiceover (if API key is set)
    if (process.env.ELEVENLABS_API_KEY) {
      updateJob(jobId, { status: "generating-voiceover", progress: 5 });
      try {
        const voiceoverDir = path.join(process.cwd(), "public", "voiceover");
        await generateVoiceover(config, voiceoverDir);
        updateJob(jobId, { progress: 20 });
      } catch (err) {
        console.error("Voiceover generation failed, continuing without:", err);
        updateJob(jobId, { progress: 20 });
      }
    } else {
      updateJob(jobId, { progress: 20 });
    }

    // Step 2: Write config to temp props file
    const propsFile = path.join(RENDERS_DIR, `${jobId}-props.json`);
    fs.writeFileSync(propsFile, JSON.stringify({ config }, null, 2));

    // Step 3: Spawn remotion render
    updateJob(jobId, { status: "bundling", progress: 22 });

    const outputPath = path.join(RENDERS_DIR, `${jobId}.mp4`);

    await new Promise<void>((resolve, reject) => {
      const child = spawn(
        "npx",
        [
          "remotion",
          "render",
          "src/index.ts",
          "Video",
          outputPath,
          `--props=${propsFile}`,
        ],
        {
          shell: true,
          cwd: process.cwd(),
          env: { ...process.env },
        }
      );

      let hasBundled = false;

      child.stderr.on("data", (data: Buffer) => {
        const text = data.toString();

        if (!hasBundled && /bundle/i.test(text)) {
          hasBundled = true;
          updateJob(jobId, { status: "rendering", progress: 25 });
        }

        const match = text.match(/(\d+)%/);
        if (match) {
          const renderPercent = parseInt(match[1], 10);
          const overallProgress = Math.round(25 + renderPercent * 0.75);
          updateJob(jobId, { status: "rendering", progress: overallProgress });
        }
      });

      child.stdout.on("data", (data: Buffer) => {
        const text = data.toString();
        const match = text.match(/(\d+)%/);
        if (match) {
          const renderPercent = parseInt(match[1], 10);
          const overallProgress = Math.round(25 + renderPercent * 0.75);
          updateJob(jobId, { status: "rendering", progress: overallProgress });
        }
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Render process exited with code ${code}`));
        }
      });

      child.on("error", (err) => {
        reject(err);
      });
    });

    // Clean up temp props file
    try {
      fs.unlinkSync(propsFile);
    } catch {
      // ignore cleanup errors
    }

    updateJob(jobId, {
      status: "done",
      progress: 100,
      outputPath,
    });
  } catch (err) {
    updateJob(jobId, {
      status: "error",
      error: err instanceof Error ? err.message : "Render failed",
    });
  } finally {
    activeRender = false;
    cleanupOldJobs();
  }
}

async function handlePostRender(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const body = await readBody(req);
    const parsed = JSON.parse(body);
    const config = parsed.config as VideoConfig;

    if (!config) {
      return sendJson(res, 400, { error: "Missing config" });
    }

    const { errors } = validateConfig(config);
    if (errors.length > 0) {
      return sendJson(res, 400, { error: "Invalid config", details: errors });
    }

    if (activeRender) {
      return sendJson(res, 409, {
        error: "A render is already in progress. Please wait for it to complete.",
      });
    }

    ensureRendersDir();

    const jobId = crypto.randomUUID();
    createJob(jobId);

    // Fire-and-forget
    runRenderPipeline(jobId, config);

    return sendJson(res, 200, { jobId });
  } catch (err) {
    return sendJson(res, 500, {
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
}

function handleGetRender(url: URL, res: http.ServerResponse) {
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return sendJson(res, 400, { error: "Missing jobId parameter" });
  }

  const job = getJob(jobId);
  if (!job) {
    return sendJson(res, 404, { error: "Job not found" });
  }

  return sendJson(res, 200, {
    status: job.status,
    progress: job.progress,
    error: job.error,
  });
}

function handleDownload(url: URL, res: http.ServerResponse) {
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return sendJson(res, 400, { error: "Missing jobId parameter" });
  }

  // Validate jobId format to prevent path traversal
  if (!/^[0-9a-f-]{36}$/.test(jobId)) {
    return sendJson(res, 400, { error: "Invalid jobId format" });
  }

  const job = getJob(jobId);
  if (!job) {
    return sendJson(res, 404, { error: "Job not found" });
  }

  if (job.status !== "done") {
    return sendJson(res, 400, {
      error: `Render is not complete (status: ${job.status})`,
    });
  }

  const filePath = path.join(RENDERS_DIR, `${jobId}.mp4`);

  if (!fs.existsSync(filePath)) {
    return sendJson(res, 404, { error: "Rendered file not found on disk" });
  }

  const stat = fs.statSync(filePath);

  setCorsHeaders(res);
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    "Content-Disposition": `attachment; filename="video-${jobId.slice(0, 8)}.mp4"`,
    "Content-Length": stat.size.toString(),
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // POST /render — start a render
  if (pathname === "/render" && req.method === "POST") {
    return handlePostRender(req, res);
  }

  // GET /render?jobId=X — check status
  if (pathname === "/render" && req.method === "GET") {
    return handleGetRender(url, res);
  }

  // GET /render/download?jobId=X — download MP4
  if (pathname === "/render/download" && req.method === "GET") {
    return handleDownload(url, res);
  }

  // Health check
  if (pathname === "/" && req.method === "GET") {
    return sendJson(res, 200, { status: "ok", service: "render-server" });
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Render server listening on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
