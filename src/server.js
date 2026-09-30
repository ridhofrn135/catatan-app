require("dotenv").config();

const express = require("express");
const path = require("node:path");
const helmet = require("helmet");
const morgan = require("morgan");
const methodOverride = require("method-override");
const statusMonitor = require("express-status-monitor");

const postsRouter = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// --- Monitoring dashboard (harus dipasang sebelum middleware lain) ---
// Dashboard real-time (CPU, memori, response time, req/s) bisa dibuka di /status
app.use(
  statusMonitor({
    title: "Catatan App - Monitoring",
    path: "/status",
  })
);

// --- Keamanan ---
app.use(helmet());

// --- Logging request (penting untuk observability / debugging di production) ---
app.use(morgan(isProduction ? "combined" : "dev"));

// --- Parsing body & method override (biar form HTML bisa kirim PUT/DELETE) ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// --- View engine ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// --- Static assets ---
app.use(express.static(path.join(__dirname, "..", "public")));

// --- Health check endpoint (dipakai load balancer / uptime monitor cloud) ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Routes ---
app.get("/", (req, res) => res.redirect("/posts"));
app.use("/posts", postsRouter);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).render("404");
});

// --- Error handler ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Terjadi kesalahan di server.");
});

// Hanya jalankan server kalau file ini dieksekusi langsung (bukan saat di-import untuk testing)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
    console.log(`Monitoring dashboard: http://localhost:${PORT}/status`);
  });
}

module.exports = app;
