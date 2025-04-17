require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandLoader');
const { loadEvents } = require('./handlers/eventLoader');
const { handleIgDownload, handleFbDownload, handleTwitterDownload } = require('./handlers/downloaderHandler');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Load commands and events
loadEvents(client);
loadCommands(client);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    handleIgDownload(message);
    handleFbDownload(message);
    handleTwitterDownload(message);
});

client.login(process.env.DISCORD_TOKEN).then(() => {
    registerCommands(client);
});