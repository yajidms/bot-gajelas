const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Removes timeout from a specific user.") // English: Removes timeout from a specific user.
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select the user you want to untimeout.") // English: Select the user you want to untimeout.
        .setRequired(true)
    )
    .setDefaultPermission(true), // English: Show command for all users

  async execute(interaction) {
    // English: Check user permissions
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      }); // English: You do not have permission to use this command.
    }

    const user = interaction.options.getUser("user");
    const guildMember = interaction.guild.members.cache.get(user.id);

    if (!guildMember) {
      return interaction.reply({
        content: `User **${user.tag}** not found on the server.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!guildMember.isCommunicationDisabled()) {
      return interaction.reply({
        content: `User **${user.tag}** is not currently in timeout.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // English: Remove timeout from user
      await guildMember.timeout(null);
      await interaction.reply({
        content: `User **${user.tag}** successfully untimed out.`,
      }); // English: User **${user.tag}** successfully untimed out. // English: Send log

      const logDetails = {
        author: {
          name: interaction.user.tag,
          icon_url: interaction.user.displayAvatarURL(),
        },
        title: "User Untimed Out", // English: User Untimed Out
        description: `User **${user.tag}** has been untimed out.`, // English: User **${user.tag}** has been untimed out.
        fields: [
          { name: "User", value: user.tag, inline: true }, // English: User
          {
            name: "Admin who Untimed Out",
            value: `<@${interaction.user.id}>`,
            inline: true,
          }, // English: Admin who Untimed Out
        ],
        userId: interaction.user.id,
        timestamp: Date.now(),
      };
      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);
    } catch (error) {
      console.error("Error saat untimeout:", error); // English: Error while untimeout:
      await interaction.reply({
        content: `An error occurred while trying to untimeout user **${user.tag}**.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
