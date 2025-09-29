import { Router } from "express";
import { v4 as uuid } from "uuid";

type JobStatus = "queued" | "running" | "failed" | "complete";
type Job = {
  id: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  resultUrl?: string;
  error?: string;
};

const jobs = new Map<string, Job>();
const router = Router();

/**
 * POST /api/tryon
 * body: { personImage: string(url|base64), garmentImage: string(url|base64) }
 * returns: { jobId }
 */
router.post("/tryon", (req, res, next) => {
  try {
    const { personImage, garmentImage } = req.body || {};
    if (!personImage || !garmentImage) {
      return res.status(400).json({ code: 400, message: "personImage and garmentImage are required" });
    }

    const id = uuid();
    const now = new Date().toISOString();

    const job: Job = { id, status: "queued", createdAt: now, updatedAt: now };
    jobs.set(id, job);

    // async processing 
    setTimeout(() => {
      const j = jobs.get(id);
      if (!j) return;

      j.status = "running";
      j.updatedAt = new Date().toISOString();
      jobs.set(id, j);

      // finish after a bit
      setTimeout(() => {
        const jj = jobs.get(id);
        if (!jj) return;

        // test error UX
        const fail = Math.random() < 0.1;
        if (fail) {
          jj.status = "failed";
          jj.error = "VTO pipeline error";
        } else {
          jj.status = "complete";
          
          jj.resultUrl = "dataa to be added later";
        }
        jj.updatedAt = new Date().toISOString();
        jobs.set(id, jj);
      }, 2000);
    }, 500);

    return res.status(202).json({ jobId: id });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tryon/:jobId
 * returns: { status, resultUrl?, createdAt, updatedAt, error? }
 */
router.get("/tryon/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) {
    return res.status(404).json({ code: 404, message: "Job not found" });
  }
  return res.json({
    status: job.status,
    resultUrl: job.resultUrl,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    error: job.error ?? null,
  });
});

export default router;
