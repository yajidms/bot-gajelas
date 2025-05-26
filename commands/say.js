const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const DEVELOPER_IDS = process.env.DEV_ID
  ? process.env.DEV_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send a message or reply to a specific message")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Content of the message to send")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reply_to")
        .setDescription("ID of the message to reply to (optional)")
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator) &&
      !DEVELOPER_IDS.includes(interaction.user.id)
    ) {
      return interaction.reply({
        content: "❌ You don't have permission to use this command!",
        ephemeral: true,
      });
    }

    try {
      const messageContent = interaction.options.getString("message");
      const replyTargetId = interaction.options.getString("reply_to");

      if (replyTargetId) {
        const replyTarget = await interaction.channel.messages.fetch(replyTargetId);
        await replyTarget.reply(messageContent);
      } else {
        await interaction.channel.send(messageContent);
      }

      await interaction.reply({
        content: "✅ Message sent successfully!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "❌ An error occurred!";
      
      if (error.message.includes("Unknown Message")) {
        errorMessage += "\n⚠️ Message ID not found in this channel!";
      }
      
      await interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  },
};