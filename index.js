import express from "express";
import axios from "axios";
import cors from "cors";
import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";

/* ======================
   EXPRESS SETUP
====================== */

const app = express();
const PORT = process.env.PORT || 10000;
const VTC_ID = 85973;

app.use(cors());
app.use(express.json());

/* ======================
   DISCORD BOT SETUP
====================== */

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const API_BASE = "https://prologistix-bot.onrender.com";

/* ======================
   EXPRESS ROUTES
====================== */

// Root
app.get("/", (req, res) => {
  res.send("PROLOGISTIX Backend & Discord Bot is running");
});

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Stats
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

// Drivers
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
   DISCORD BOT EVENTS
====================== */

client.once("ready", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // /stats
  if (interaction.commandName === "stats") {
    try {
      const res = await axios.get(`${API_BASE}/api/stats`);

      const embed = new EmbedBuilder()
        .setTitle("🚛 PROLOGISTIX INC. — VTC Stats")
        .setColor(0x1f2937)
        .addFields(
          { name: "Drivers", value: `${res.data.drivers}`, inline: true },
          { name: "Distance", value: `${res.data.distance}`, inline: true },
          { name: "Convoys", value: `${res.data.convoys}`, inline: true }
        )
        .setFooter({ text: "Live TruckersMP data" });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Failed to fetch VTC stats.",
        ephemeral: true
      });
    }
  }

  // /drivers
  if (interaction.commandName === "drivers") {
    try {
      const res = await axios.get(`${API_BASE}/api/drivers`);
      const drivers = res.data.drivers.slice(0, 10);

      const embed = new EmbedBuilder()
        .setTitle("👥 PROLOGISTIX INC. — Drivers")
        .setColor(0x1f2937)
        .setDescription(
          drivers.map(d => `• **${d.name}** — ${d.role}`).join("\n")
        )
        .setFooter({ text: "Showing first 10 drivers" });

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "❌ Failed to fetch drivers.",
        ephemeral: true
      });
    }
  }
});

/* ======================
   START EVERYTHING
====================== */

app.listen(PORT, () => {
  console.log(`🌐 Backend running on port ${PORT}`);
});

// Discord login
client.login(process.env.DISCORD_TOKEN);
