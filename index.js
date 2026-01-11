import express from "express";
import axios from "axios";
import cors from "cors";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes
} from "discord.js";

/* ======================
   ENV VARIABLES
====================== */

const PORT = process.env.PORT || 10000;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;

const VTC_ID = 85973;

/* ======================
   EXPRESS BACKEND
====================== */

const app = express();
app.use(cors());
app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("PROLOGISTIX Backend is running");
});

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Stats
app.get("/api/stats", async (req, res) => {
  try {
    const r = await axios.get(`https://api.truckersmp.com/v2/vtc/${VTC_ID}`);
    const vtc = r.data?.response || {};
    const members = vtc.members || [];

    res.json({
      drivers: members.length,
      distance: vtc.distance || 0,
      convoys: vtc.convoys || 0
    });
  } catch (err) {
    console.error("Stats fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Drivers
app.get("/api/drivers", async (req, res) => {
  try {
    const r = await axios.get(`https://api.truckersmp.com/v2/vtc/${VTC_ID}`);
    const members = r.data?.response?.members || [];

    const drivers = members.map(m => ({
      id: m.id,
      name: m.username,
      role: m.role,
      steamId: m.steamID,
      joinedAt: m.joinedAt
    }));

    res.json({
      total: drivers.length,
      drivers
    });
  } catch (err) {
    console.error("Drivers fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch drivers" });
  }
});

// Start backend
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

/* ======================
   DISCORD BOT
====================== */

if (!DISCORD_TOKEN) {
  console.warn("⚠️ Discord token missing — bot disabled");
} else {
  startDiscordBot();
}

async function startDiscordBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  /* ======================
     SLASH COMMANDS
  ====================== */

  const commands = [
    {
      name: "stats",
      description: "View PROLOGISTIX VTC stats"
    },
    {
      name: "drivers",
      description: "View PROLOGISTIX drivers"
    }
  ];

  if (CLIENT_ID) {
    try {
      console.log("Registering slash commands...");
      const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

      await rest.put(
        GUILD_ID
          ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
          : Routes.applicationCommands(CLIENT_ID),
        { body: commands }
      );

      console.log("✅ Slash commands registered");
    } catch (err) {
      console.error("❌ Slash command registration failed:", err.message);
    }
  } else {
    console.warn("⚠️ Client ID missing — skipping slash command registration");
  }

  /* ======================
     HELPERS
  ====================== */

  async function fetchVTC() {
    try {
      const r = await axios.get(`https://api.truckersmp.com/v2/vtc/${VTC_ID}`);
      return r.data?.response || {};
    } catch (err) {
      console.error("VTC fetch failed:", err.message);
      return {};
    }
  }

  /* ======================
     INTERACTIONS
  ====================== */

  client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
      if (interaction.commandName === "stats") {
        await interaction.deferReply();

        const vtc = await fetchVTC();
        const members = vtc.members || [];

        await interaction.editReply({
          embeds: [{
            title: "📊 PROLOGISTIX Stats",
            color: 0x22c55e,
            fields: [
              { name: "Drivers", value: `${members.length}`, inline: true },
              { name: "Distance", value: `${vtc.distance || 0}`, inline: true },
              { name: "Convoys", value: `${vtc.convoys || 0}`, inline: true }
            ]
          }]
        });
      }

      if (interaction.commandName === "drivers") {
        await interaction.deferReply();

        const vtc = await fetchVTC();
        const members = vtc.members || [];

        const list = members
          .slice(0, 20)
          .map(m => `• ${m.username}`)
          .join("\n");

        await interaction.editReply({
          embeds: [{
            title: "🚛 PROLOGISTIX Drivers",
            description: list || "No drivers found.",
            footer: {
              text: `Showing ${Math.min(20, members.length)} of ${members.length}`
            },
            color: 0x22c55e
          }]
        });
      }

    } catch (err) {
      console.error("Interaction error:", err.message);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply("❌ An error occurred.");
      }
    }
  });

  client.once("clientReady", () => {
    console.log(`🤖 Discord bot logged in as ${client.user.tag}`);
  });

  client.login(DISCORD_TOKEN);
}
