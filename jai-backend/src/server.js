require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const promptRoutes = require("./routes/prompt");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow no-origin requests (curl, server-to-server health checks)
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      console.error(`CORS blocked origin: "${origin}". Allowed: ${allowedOrigins.join(", ")}`);
      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "200kb" }));

// Global rate limit: 60 requests / minute / IP. Tune per route if needed.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
app.use("/api", limiter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", promptRoutes);

// Centralized error handler — never leak stack traces to the client
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`J.ai backend running on port ${PORT}`);
});
