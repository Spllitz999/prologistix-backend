import express from "express";
import axios from "axios";
import cors from "cors";
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

/* ======================
   CONFIG
====================== */

const PORT = process.env.PORT || 10000;
const VTC_ID = 85973;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

/* ======================
   EXPRESS BACKEND
====================== */

const app = express();
app.use(cors());
app.use(express.json());

// Root check
app.get("/", (req, res) => {
  res.send("PROLOGISTIX Backend & Discord Bot is running");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Stats endpoint
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

// Drivers endpoint
app.get("/api/drivers", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.truckersmp.com/v2/vtc/${VTC_ID}`
    );

    const members = response.data.response?.members || [];

    res.json({
      total: members.length,
      drivers: members.map(m => ({
        id: m.id,
        name: m.username,
        role: m.role,
        steamId: m.steamID,
        joinedAt: m.joinedAt
      }))
    });
  } catch (error) {
    console.error("Drivers fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

/* ======================
   START EXPRESS
====================== */

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

/* ======================
   DISCORD BOT
====================== */

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("❌ Missing Discord environment variables");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ======================
   SLASH COMMANDS
====================== */

const commands = [
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show PROLOGISTIX VTC stats"),

  new SlashCommandBuilder()
    .setName("drivers")
    .setDescription("Show PROLOGISTIX drivers (top 20)")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Slash commands registered");
  } catch (error) {
    console.error("❌ Command registration failed:", error);
  }
})();

/* ======================
   HELPER
====================== */

async function fetchVTC() {
  const response = await axios.get(
    `https://api.truckersmp.com/v2/vtc/${VTC_ID}`
  );
  return response.data.response;
}

/* ======================
   INTERACTIONS
====================== */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // /stats
    if (interaction.commandName === "stats") {
      await interaction.deferReply();

      const vtc = await fetchVTC();

      await interaction.editReply({
        embeds: [{
          title: "📊 PROLOGISTIX Stats",
          fields: [
            { name: "Drivers", value: String(vtc.members.length), inline: true },
            { name: "Distance", value: `${vtc.distance.toLocaleString()} km`, inline: true },
            { name: "Convoys", value: String(vtc.convoys), inline: true }
          ],
          color: 0x22c55e
        }]
      });
    }

    // /drivers
    if (interaction.commandName === "drivers") {
      await interaction.deferReply(); // 🔑 REQUIRED

      const vtc = await fetchVTC();

      const list = vtc.members
        .slice(0, 20)
        .map(m => `• ${m.username}`)
        .join("\n");

      await interaction.editReply({
        embeds: [{
          title: "🚛 PROLOGISTIX Drivers",
          description: list || "No drivers found",
          footer: {
            text: `Showing ${Math.min(20, vtc.members.length)} of ${vtc.members.length}`
          },
          color: 0x22c55e
        }]
      });
    }

  } catch (error) {
    console.error("Interaction error:", error);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply("❌ Failed to fetch data.");
    } else {
      await interaction.reply({
        content: "❌ Failed to fetch data.",
        ephemeral: true
      });
    }
  }
});

/* ======================
   LOGIN
====================== */

client.once("ready", () => {
  console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
});

client.login(DISCORD_TOKEN);
