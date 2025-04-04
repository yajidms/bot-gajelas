require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { loadCommands } = require('./handlers/commandLoader');
const { loadEvents } = require('./handlers/eventLoader');
const { registerCommands } = require('./registerCommands');
const { handleX, handleIg, handleFb, handleTt } = require('./handlers/downloaderHandler'); // Perubahan di sini

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
    if (message.content.startsWith('f.x')) handleX(message);
    if (message.content.startsWith('f.ig')) handleIg(message);
    if (message.content.startsWith('f.fb')) handleFb(message);
    if (message.content.startsWith('f.tt')) handleTt(message);
});

client.login(process.env.DISCORD_TOKEN).then(() => {
    registerCommands(client);
});