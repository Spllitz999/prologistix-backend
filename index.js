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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

function requireAdmin(req, res, next) {
  if (req.session.admin) return next();
  res.redirect("/login");
}

/* ---------- AUTH ---------- */

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== process.env.ADMIN_USER) {
    return res.status(401).send("Invalid login");
  }

  const match = await bcrypt.compare(
    password,
    await bcrypt.hash(process.env.ADMIN_PASS, 10)
  );

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
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve other static files from public folder
app.use("/admin", requireAdmin, express.static(path.join(__dirname, "public")));

/* ---------- SERVER ---------- */

app.get("/", (req, res) => {
  res.send("Prologistix Backend Running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

