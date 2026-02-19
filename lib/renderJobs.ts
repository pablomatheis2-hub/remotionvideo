export type RenderStatus =
  | "queued"
  | "generating-voiceover"
  | "bundling"
  | "rendering"
  | "done"
  | "error";

export interface RenderJob {
  id: string;
  status: RenderStatus;
  progress: number; // 0-100
  outputPath?: string;
  error?: string;
  createdAt: number;
}

// In-memory job store (sufficient for single-server use)
const jobs = new Map<string, RenderJob>();

export function createJob(id: string): RenderJob {
  const job: RenderJob = {
    id,
    status: "queued",
    progress: 0,
    createdAt: Date.now(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id: string): RenderJob | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, updates: Partial<RenderJob>): void {
  const job = jobs.get(id);
  if (job) {
    Object.assign(job, updates);
  }
}

// Clean up old jobs (>1 hour)
export function cleanupOldJobs(): void {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    if (job.createdAt < cutoff) {
      jobs.delete(id);
    }
  }
}
