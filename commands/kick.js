const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the server.") // Mengeluarkan pengguna dari server.
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to be kicked.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("alasan")
        .setDescription("Reason for the kick.") // Alasan kick.
        .setRequired(false)
    )
    .setDefaultPermission(true),

  async execute(interaction) {
    // Check user permissions
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("alasan") || "No reason provided.";
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await member.kick(reason);
      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Kicked", // User Kicked
        description: `${user.tag} has been kicked!`,
        fields: [
          { name: "User ID", value: user.id, inline: true },
          { name: "Reason", value: reason, inline: true },
        ],
        userId: user.id,
        timestamp: Date.now(),
      };
      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);

      interaction.reply({
        content: `**${user.tag}** successfully kicked. Reason: ${reason}`,
      });
    } catch (error) {
      console.error("Error while kicking:", error);
      return interaction.reply({
        content: "An error occurred while trying to kick the user.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};