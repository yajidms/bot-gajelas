const { handleEmbed } = require("../handlers/embedHandler");
const { handleAiChat } = require("../handlers/aiHandler");

const ALLOWED_GUILD_IDS = process.env.GUILD_ID
  ? process.env.GUILD_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    // Jangan proses pesan yang dikirim oleh bot
    if (message.author.bot) return;

    // Batasi hanya untuk server tertentu
    if (!message.guild || !ALLOWED_GUILD_IDS.includes(message.guild.id)) return;

    await handleEmbed(message, client);
    await handleAiChat(message);
  },
};
