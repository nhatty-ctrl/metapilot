import express from "express";
import cors from "cors";

import userRoutes from "./routes/users.js";
import chatRoutes from "./routes/chat.js";
import geminiRoutes from "./routes/gemini.js";
import yieldsRoutes from "./routes/yields.js";
import transactionRoutes from "./routes/transactions.js";
import balancesRoutes from "./routes/balances.js";
import testRoutes from "./routes/test.js";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    const isVercelPreview = !!origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

    if (!origin || process.env.FRONTEND_URL === "*" || allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.get("/api/status", (_req, res) => {
  res.json({
    status: "ok",
    project: "Yield Autopilot",
    version: "1.0.0",
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    network: "Arbitrum One",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    project: "Yield Autopilot",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/yields", yieldsRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/balances", balancesRoutes);
app.use("/api/test", testRoutes);

app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  if (err.message?.startsWith("CORS blocked origin")) {
    return res.status(403).json({ error: "Origin not allowed by CORS" });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
