// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const { buildVectorIndex } = require("./services/ragService");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security middleware ──
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10kb" }));

// ── Rate limiting ──
app.use("/api/", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use("/api/chat", rateLimit({ windowMs: 60 * 1000, max: 20 }));

// ── Routes ──
app.use("/api/auth",    require("./routes/auth"));
app.use("/api/student", require("./routes/student"));
app.use("/api/chat",    require("./routes/chat"));

// ── Health ──
app.get("/api/health", (req, res) =>
  res.json({ status: "OK", service: "University Assistant API", timestamp: new Date().toISOString() })
);

// ── 404 ──
app.use((req, res) => res.status(404).json({ success: false, error: "Route not found." }));

// ── Error handler ──
app.use((err, req, res, next) => {
  logger.error("Unhandled error: " + err.message);
  res.status(500).json({ success: false, error: "Internal server error." });
});

// ── Start ──
async function start() {
  app.listen(PORT, async () => {
    logger.info(`🚀 University Assistant API → http://localhost:${PORT}`);
    logger.info("🔨 Building vector index for RAG...");
    try {
      await buildVectorIndex();
      logger.info("✅ RAG pipeline ready!");
    } catch (e) {
      logger.warn("⚠️  Vector index build skipped: " + e.message);
    }
  });
}

start();

module.exports = app; // for testing
