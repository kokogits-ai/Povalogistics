import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // API routes
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@pova.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "koko";

    if (email === adminEmail && password === adminPassword) {
      res.cookie("adminToken", "pova_admin_session_active", { httpOnly: true, maxAge: 86400000 });
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie("adminToken");
    res.json({ success: true });
  });

  app.get("/api/admin/check", (req, res) => {
    if (req.cookies.adminToken === "pova_admin_session_active") {
      return res.json({ authenticated: true });
    }
    res.status(401).json({ authenticated: false });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
