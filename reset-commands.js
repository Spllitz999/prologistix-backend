require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Deleting all guild commands...');

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: [] }
    );

    console.log('All guild commands deleted.');
  } catch (error) {
    console.error(error);
  }
})();
