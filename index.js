import express from "express";
import axios from "axios";
import cors from "cors";


const app = express();
app.use(cors());

const VTC_ID = 85973;

// 🔹 Root check (for browser)
app.get("/", (req, res) => {
  res.send("PROLOGISTIX Backend is running");
});

// 🔹 Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 🔹 Stats
app.get("/api/stats", async (req, res) => {
  try {
/*    const r = await axios.get(`https://api.truckersmp.com/v2/vtc/${VTC_ID}`);
    const vtc = r.data.response;

    res.json({
      drivers: vtc.members.length,
      distance: vtc.distance,
      convoys: vtc.convoys
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
*/
const res = await fetch("https://api.truckersmp.com/v2/vtc/85973");
const json = await res.json();

const members = json?.response?.members || [];

console.log("Members fetched:", members.length);

});

// 🔹 Drivers
app.get("/api/drivers", async (req, res) => {
  try {
    const r = await axios.get(`https://api.truckersmp.com/v2/vtc/${VTC_ID}`);

    const drivers = r.data.response.members.map(m => ({
      name: m.username,
      role: m.role,
      steamId: m.steamID,
      joinedAt: m.joinedAt
    }));

    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);

