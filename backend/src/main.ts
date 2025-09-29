import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { v4 as uuid } from "uuid";

const app = express();

/** Core middleware */
app.set("trust proxy", 1);
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

/** Request ID for tracing */
app.use((req, res, next) => {
  (req as any).requestId = req.headers["x-request-id"] || uuid();
  res.setHeader("x-request-id", (req as any).requestId);
  next();
});

/** Basic rate limiting */
app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);

/** Health route */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptimeSec: process.uptime(),
    now: new Date().toISOString(),
    version: "0.1.0"
  });
});

/** OpenAPI */
const openApi = {
  openapi: "3.0.3",
  info: {
    title: "Capstone AI Fashion — API",
    version: "0.1.0",
    description:
      "Gateway skeleton test..."
  },
  paths: {
    "/health": {
      get: { summary: "Health check", responses: { "200": { description: "OK" } } }
    }
  }
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApi, { explorer: true }));

/** JSON error handler */
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const code = typeof err?.status === "number" ? err.status : 500;
    const message =
      err?.message || (code === 500 ? "Internal Server Error" : "Request failed");
    res.status(code).json({ code, message, details: err?.details || null });
  }
);

/** Boot */
const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(` Backend:  http://localhost:${PORT}`);
  console.log(`Docs:     http://localhost:${PORT}/docs`);
  console.log(`Health:   http://localhost:${PORT}/health`);
});
