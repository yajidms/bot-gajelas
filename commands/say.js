const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");
const os = require("os");

const DEVELOPER_IDS = process.env.DEV_ID
  ? process.env.DEV_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send a message or reply to a specific message")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("Content of the message to send")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reply_to")
        .setDescription("ID of the message to reply to (optional)")
    )
    .addAttachmentOption(option =>
      option.setName("file").setDescription("File to attach (optional)")
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !DEVELOPER_IDS.includes(interaction.user.id)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const messageContent = interaction.options.getString("message");
      const replyTargetId = interaction.options.getString("reply_to");
      const attachment = interaction.options.getAttachment("file");
      let tempFilePath;

      if (attachment) {
        // Download attachment to temp
        const res = await fetch(attachment.url);
        const buffer = Buffer.from(await res.arrayBuffer());
        tempFilePath = path.join(os.tmpdir(), attachment.name);
        fs.writeFileSync(tempFilePath, buffer);
      }

      // Prepare send options
      const sendOptions = { content: messageContent };
      if (attachment) {
        sendOptions.files = [tempFilePath];
      }

      // Send or reply once
      if (replyTargetId) {
        const replyTarget = await interaction.channel.messages.fetch(replyTargetId);
        await replyTarget.reply(sendOptions);
      } else {
        await interaction.channel.send(sendOptions);
      }

      // Clean up temp file
      if (tempFilePath) {
        fs.unlinkSync(tempFilePath);
      }

      // Acknowledge to the user
      await interaction.reply({
        content: "✅ Message sent successfully!",
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "❌ An error occurred!";
      if (error.message.includes("Unknown Message")) {
        errorMessage += "\n⚠️ Message ID not found in this channel!";
      }
      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};