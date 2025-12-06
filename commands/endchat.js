const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { activeAIChats } = require("../handlers/aiChatState");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aichat_end")
    .setDescription("End your current Gemini AI chat session in this thread."),
  async execute(interaction) {
    const channelId = interaction.channel.id;
    const chatData = activeAIChats.get(channelId);

    if (!chatData || chatData.userId !== interaction.user.id) {
      await interaction.reply({
        content: "You do not have an active AI chat session in this thread.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    activeAIChats.delete(channelId);

    await interaction.reply({
      content: "Your AI chat session has ended. This thread will remain open for further discussion.",
      flags: MessageFlags.Ephemeral,
    });
  },
};