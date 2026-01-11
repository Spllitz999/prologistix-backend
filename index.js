import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;
const VTC_ID = 85973;

app.use(cors());
app.use(express.json());

/* ======================
   ROOT & HEALTH CHECKS
====================== */

// Root (browser check)
app.get("/", (req, res) => {
  res.send("PROLOGISTIX Backend is running");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ======================
   VTC STATS
====================== */

app.get("/api/stats", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.truckersmp.com/v2/vtc/${VTC_ID}`
    );

    const vtc = response.data.response;
    const members = vtc?.members || [];

    res.json({
      drivers: members.length,
      distance: vtc.distance,
      convoys: vtc.convoys
    });

  } catch (error) {
    console.error("Stats fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/* ======================
   DRIVERS LIST
====================== */

app.get("/api/drivers", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.truckersmp.com/v2/vtc/${VTC_ID}`
    );

    const members = response.data.response?.members || [];

    const drivers = members.map(member => ({
      id: member.id,
      name: member.username,
      role: member.role,
      steamId: member.steamID,
      joinedAt: member.joinedAt
    }));

    res.json({
      total: drivers.length,
      drivers
    });

  } catch (error) {
    console.error("Drivers fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

/* ======================
   START SERVER
====================== */

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
