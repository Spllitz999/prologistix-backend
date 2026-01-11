import { REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View PROLOGISTIX VTC stats"),

  new SlashCommandBuilder()
    .setName("drivers")
    .setDescription("View PROLOGISTIX drivers")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered");

  } catch (error) {
    console.error("❌ Slash command registration failed:", error);
  }
})();
