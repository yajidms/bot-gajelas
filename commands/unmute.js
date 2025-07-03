const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Removes mute from a specific user.") // English: Removes mute from a specific user.
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select the user you want to unmute.") // English: Select the user you want to unmute.
        .setRequired(true)
    )
    .setDefaultPermission(true), // English: Show command for all users

  async execute(interaction) {
    // English: Check user permissions
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("user");
    const guildMember = interaction.guild.members.cache.get(user.id);
    const mutedRoleId = process.env.MUTED_ROLE_ID;

    if (!guildMember) {
      return interaction.reply({
        content: `User **${user.tag}** not found on the server.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!guildMember.roles.cache.has(mutedRoleId)) {
      return interaction.reply({
        content: `User **${user.tag}** is not currently muted.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      // English: Remove mute role
      await guildMember.roles.remove(mutedRoleId);
      await interaction.reply({
        content: `User **${user.tag}** successfully unmuted.`, // English: User **${user.tag}** successfully unmuted.
      }); // Kirimkan log

      const logDetails = {
        author: {
          name: interaction.user.tag,
          icon_url: interaction.user.displayAvatarURL(),
        },
        title: "User Unmuted",
        description: `User **${user.tag}** has been unmuted.`, // English: User **${user.tag}** has been unmuted.
        fields: [
          { name: "User", value: user.tag, inline: true },
          {
            name: "Admin who Unmuted", // English: Admin who Unmuted
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
        ],
        userId: interaction.user.id,
        timestamp: Date.now(),
      };
      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);
    } catch (error) {
      console.error("Error saat unmute:", error);
      await interaction.reply({
        content: `An error occurred while trying to unmute user **${user.tag}**.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
