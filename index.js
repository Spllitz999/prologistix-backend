import express from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import applicationsRoutes from "./routes/applications.js";

const app = express();

// Hash admin password once at startup for comparison
const ADMIN_PASS_HASH = await bcrypt.hash(process.env.ADMIN_PASS || "", 10);

// Public assets (frontend marketing site)
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  }
}));

function requireAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.redirect("/login");
}

/* ---------- AUTH ---------- */

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USER) {
    return res.status(401).send("Invalid login");
  }

  const match = await bcrypt.compare(password, ADMIN_PASS_HASH);

  if (!match) {
    return res.status(401).send("Invalid login");
  }

  req.session.admin = true;
  res.redirect("/admin");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

/* ---------- PROTECTED ---------- */

app.use("/api/applications", requireAdmin, applicationsRoutes);

// Serve admin dashboard (index.html) at /admin
app.get("/admin", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin", "index.html"));
});

// Serve other static files from public folder
app.use("/admin", requireAdmin, express.static(path.join(__dirname, "public", "admin")));

/* ---------- SERVER ---------- */

app.get("/", (req, res) => {
  res.send("Prologistix Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

