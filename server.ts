import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { db } from "./src/lib/db.server.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Middleware to protect admin routes
  const authenticateAdmin = (req: any, res: any, next: any) => {
    if (req.cookies.adminToken === "pova_admin_session_active") {
      return next();
    }
    res.status(401).json({ error: "Unauthorized" });
  };

  // API routes
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "admin@pova.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "koko";
    const userEmail = "avotv2020@gmail.com";

    if ((email === adminEmail || email === userEmail) && password === adminPassword) {
      res.cookie("adminToken", "pova_admin_session_active", { httpOnly: true, maxAge: 86400000 });
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  });

  // GET Shipment by Tracking Number (Public)
  app.get("/api/shipments/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const result = await db.query(
        `SELECT 
          id, tracking_number as "trackingNumber", status, 
          origin_city as "originCity", origin_country as "originCountry", origin_lat as "originLat", origin_lng as "originLng",
          current_city as "currentCity", current_country as "currentCountry", current_lat as "currentLat", current_lng as "currentLng",
          destination_city as "destinationCity", destination_country as "destinationCountry", destination_lat as "destinationLat", destination_lng as "destinationLng",
          sender_name as "senderName", sender_city as "senderCity", sender_country as "senderCountry", sender_phone as "senderPhone", sender_email as "senderEmail",
          receiver_name as "receiverName", receiver_city as "receiverCity", receiver_country as "receiverCountry", receiver_phone as "receiverPhone", receiver_email as "receiverEmail", receiver_address as "receiverAddress",
          package_title as "packageTitle", package_weight as "packageWeight", package_quantity as "packageQuantity", shipping_method as "shippingMethod", priority,
          estimated_delivery as "estimatedDelivery", duty_fees as "dutyFees", clearance_fee as "clearanceFee", is_paused as "isPaused", hold_reason as "holdReason", images,
          created_at as "createdAt", updated_at as "updatedAt"
        FROM shipments WHERE tracking_number = $1`,
        [trackingNumber]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Shipment not found" });
      }

      // Format data into nested objects for frontend
      const r = result.rows[0];
      const shipment = {
        id: r.id,
        trackingNumber: r.trackingNumber,
        status: r.status,
        origin: { city: r.originCity, country: r.originCountry, lat: r.originLat, lng: r.originLng },
        current: { city: r.currentCity, country: r.currentCountry, lat: r.currentLat, lng: r.currentLng },
        destination: { city: r.destinationCity, country: r.destinationCountry, lat: r.destinationLat, lng: r.destinationLng },
        sender: { name: r.senderName, city: r.senderCity, country: r.senderCountry, phone: r.senderPhone, email: r.senderEmail },
        receiver: { name: r.receiverName, city: r.receiverCity, country: r.receiverCountry, phone: r.receiverPhone, email: r.receiverEmail, address: r.receiverAddress },
        package: { title: r.packageTitle, weight: r.packageWeight, quantity: r.packageQuantity, shippingMethod: r.shippingMethod, priority: r.priority },
        estimatedDelivery: r.estimatedDelivery,
        dutyFees: r.dutyFees,
        clearanceFee: r.clearanceFee,
        isPaused: r.isPaused,
        holdReason: r.holdReason,
        images: r.images,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      };

      const updates = await db.query(
        "SELECT id, status, location, description, timestamp FROM shipment_updates WHERE shipment_id = $1 ORDER BY timestamp DESC",
        [shipment.id]
      );

      res.json({ ...shipment, updates: updates.rows });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin: Get all shipments
  app.get("/api/admin/shipments", authenticateAdmin, async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM shipments ORDER BY created_at DESC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin: Create shipment
  app.post("/api/admin/shipments", authenticateAdmin, async (req, res) => {
    try {
      const s = req.body;
      const query = `
        INSERT INTO shipments (
          tracking_number, status, origin_city, origin_country, origin_lat, origin_lng,
          current_city, current_country, current_lat, current_lng,
          destination_city, destination_country, destination_lat, destination_lng,
          sender_name, sender_city, sender_country, sender_phone, sender_email,
          receiver_name, receiver_city, receiver_country, receiver_phone, receiver_email, receiver_address,
          package_title, package_weight, package_quantity, shipping_method, priority,
          estimated_delivery, duty_fees, clearance_fee, is_paused, hold_reason, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
        RETURNING *
      `;
      const values = [
        s.trackingNumber, s.status, s.origin?.city, s.origin?.country, s.origin?.lat, s.origin?.lng,
        s.current?.city, s.current?.country, s.current?.lat, s.current?.lng,
        s.destination?.city, s.destination?.country, s.destination?.lat, s.destination?.lng,
        s.sender?.name, s.sender?.city, s.sender?.country, s.sender?.phone, s.sender?.email,
        s.receiver?.name, s.receiver?.city, s.receiver?.country, s.receiver?.phone, s.receiver?.email, s.receiver?.address,
        s.package?.title, s.package?.weight, s.package?.quantity, s.package?.shippingMethod, s.package?.priority,
        s.estimatedDelivery, s.dutyFees, s.clearanceFee, s.isPaused, s.holdReason, s.images || []
      ];
      const result = await db.query(query, values);
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin: Add Update
  app.post("/api/admin/shipments/:id/updates", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, location, description } = req.body;
      const result = await db.query(
        "INSERT INTO shipment_updates (shipment_id, status, location, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [id, status, location, description]
      );
      
      // Update shipment master status as well
      await db.query("UPDATE shipments SET status = $1, updated_at = NOW() WHERE id = $2", [status, id]);
      
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin: Update shipment
  app.patch("/api/admin/shipments/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const s = req.body;
      // Map frontend camelCase to DB snake_case for updates
      const query = `
        UPDATE shipments SET
          status = $1, origin_city = $2, origin_country = $3, origin_lat = $4, origin_lng = $5,
          current_city = $6, current_country = $7, current_lat = $8, current_lng = $9,
          destination_city = $10, destination_country = $11, destination_lat = $12, destination_lng = $13,
          is_paused = $14, hold_reason = $15, updated_at = NOW()
        WHERE id = $16
        RETURNING *
      `;
      const values = [
        s.status, s.origin?.city, s.origin?.country, s.origin?.lat, s.origin?.lng,
        s.current?.city, s.current?.country, s.current?.lat, s.current?.lng,
        s.destination?.city, s.destination?.country, s.destination?.lat, s.destination?.lng,
        s.isPaused, s.holdReason, id
      ];
      const result = await db.query(query, values);
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin: Delete shipment
  app.delete("/api/admin/shipments/:id", authenticateAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await db.query("DELETE FROM shipments WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
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
