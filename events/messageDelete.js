const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

const ALLOWED_GUILD_IDS = process.env.GUILD_ID
  ? process.env.GUILD_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(client, deletedMessage) {
    // Batasi hanya untuk server tertentu
    if (
      !deletedMessage.guild ||
      !ALLOWED_GUILD_IDS.includes(deletedMessage.guild.id)
    )
      return;

    // Ensure message is valid and not from a bot
    if (!deletedMessage || !deletedMessage.author || deletedMessage.author.bot)
      return;

    const logChannelId = process.env.LOG_CHANNEL_ID;

    // Create fields array for attachments if they exist
    const fields = [];

    // Handle attachments efficiently without unnecessary mapping
    if (deletedMessage.attachments && deletedMessage.attachments.size > 0) {
      // Instead of mapping all attachments which stays in memory,
      // process them directly and only keep what's needed
      const attachmentList = [];

      // Process only the first 5 attachments to avoid oversized embeds
      let count = 0;
      deletedMessage.attachments.forEach((attachment) => {
        if (count < 5) {
          attachmentList.push(`[${attachment.name}](${attachment.proxyURL})`);
          count++;
        }
      });

      // Add a single field for all attachments
      if (attachmentList.length > 0) {
        fields.push({
          name: "Attachments",
          value: attachmentList.join("\n"),
        });
      }

      // If there were more attachments than we displayed
      if (deletedMessage.attachments.size > 5) {
        fields.push({
          name: "Note",
          value: `${
            deletedMessage.attachments.size - 5
          } more attachments not shown`,
        });
      }
    }

    // Create embed for deleted message
    const logDetails = {
      color: 0xff0000,
      title: `Messages sent by ${deletedMessage.author.tag} removed on ${deletedMessage.channel.url}`,
      description: `${deletedMessage.content || "No message content"}`,
      author: {
        name: deletedMessage.author.tag,
        icon_url: deletedMessage.author.displayAvatarURL(),
      },
      fields: fields,
      footer: {
        text: `User ID: ${deletedMessage.author.id} | Message ID: ${deletedMessage.id}`,
      },
      timestamp: Date.now(),
      userId: deletedMessage.author.id,
      messageId: deletedMessage.id,
    };

    // Send log to log channel
    await sendLog(client, logChannelId, logDetails);
  },
};
