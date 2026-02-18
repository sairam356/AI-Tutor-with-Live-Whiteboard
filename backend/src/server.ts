import "dotenv/config";
import express from "express";
import cors from "cors";
import chatRouter from "./routes/chat.js";
import threadsRouter from "./routes/threads.js";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/chat", chatRouter);
app.use("/api/threads", threadsRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
);

app.listen(PORT, () => {
  console.log(`AI Tutor API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
});

export default app;
