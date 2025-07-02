const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");

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
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Sorry, only server administrators can use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const amount = interaction.options.getInteger("amount");
    let totalDeleted = 0;
    let remaining = amount;

try {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  while (remaining > 0) {
    const deleteCount = Math.min(remaining, 100);
    const deletedMessages = await interaction.channel.bulkDelete(deleteCount, true);
    const deletedSize = deletedMessages.size;
    totalDeleted += deletedSize;
    remaining -= deletedSize;
    if (deletedSize === 0) break;
  }

  await interaction.editReply({
    content:
      `🧹 Successfully deleted ${totalDeleted} messages.` +
      (totalDeleted < amount
        ? "\n⚠️ Some messages may be older than 14 days and could not be deleted."
        : ""),
  });
} catch (error) {
  console.error(error);
  await interaction.editReply({
    content: "❌ An error occurred while deleting messages.",
  });
}
  },
};