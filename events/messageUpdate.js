const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

const ALLOWED_GUILD_IDS = process.env.GUILD_ID
  ? process.env.GUILD_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(client, oldMessage, newMessage) {
    if (!oldMessage.guild || !ALLOWED_GUILD_IDS.includes(oldMessage.guild.id))
      return;

    if (
      !oldMessage.author ||
      oldMessage.author.bot ||
      oldMessage.content === newMessage.content
    )
      return;
    const logChannelId = process.env.LOG_CHANNEL_ID;

    // Create an embed for the edited message
    const logDetails = {
      color: 0xffcc00,
      title: `message edited on https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${newMessage.id}`,
      description: `**before**:\n${oldMessage.content}\n\n**after**:\n${newMessage.content}`,
      author: {
        name: oldMessage.author.tag,
        icon_url: oldMessage.author.displayAvatarURL(),
      },
      fields: [],
      footer: {
        text: `ID User: ${oldMessage.author.id} | ID Message: ${newMessage.id}`,
      },
      timestamp: Date.now(),
      userId: oldMessage.author.id,
      messageId: newMessage.id,
    };

    // Mengirim log ke channel log
    await sendLog(client, logChannelId, logDetails);
  },
};
