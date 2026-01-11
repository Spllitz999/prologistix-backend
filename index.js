require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
      await interaction.reply({ content: 'Pong!', ephemeral: false });
    }
  } catch (error) {
    console.error('Interaction error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Something went wrong.',
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.TOKEN);

