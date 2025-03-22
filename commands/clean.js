const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clean-message")
    .setDescription("Delete a certain number of messages")
    .addIntegerOption(option =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1-1000)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1000)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction) {
    // 1. Double-check permissions (optional extra layer)
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Sorry, only server administrators can use this command.",
        ephemeral: true,
      });
    }

    const amount = interaction.options.getInteger("amount");

    try {
      // 2. Delete messages
      const deletedMessages = await interaction.channel.bulkDelete(amount, true);
      
      // 3. Send confirmation
      await interaction.reply({
        content: `🧹 Successfully deleted ${deletedMessages.size} messages.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error cleaning messages:", error);
      await interaction.reply({
        content: "Failed to delete messages. Messages older than 14 days or missing permissions.",
        ephemeral: true,
      });
    }
  },
};