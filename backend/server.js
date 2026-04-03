
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: [
    "https://quizengine-sepia.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

app.use("/api/auth",      require("./routes/auth"));
app.use("/api/users",     require("./routes/users"));
app.use("/api/questions", require("./routes/questions"));
app.use("/api/topics",    require("./routes/topics"));
app.use("/api/quiz",      require("./routes/quiz"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.use(cors());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 QuizEngine server running on http://localhost:${PORT}`);
});
