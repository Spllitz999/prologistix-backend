require('dotenv').config();
const { SlashCommandBuilder, REST, Routes } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Registering guild slash commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log('Guild slash commands registered!');
  } catch (error) {
    console.error(error);
  }
})();
