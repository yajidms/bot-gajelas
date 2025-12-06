const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const ms = require("ms");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Times out a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration")
        .setDescription("Timeout duration (e.g., 10m, 1h).")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Timeout reason.")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("duration");
    const reason =
      interaction.options.getString("reason") || "No reason provided.";
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const timeoutDuration = ms(duration);
      await member.timeout(timeoutDuration, reason);

      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Timed Out",
        description: `${user.tag} has been timed out.`,
        fields: [
          { name: "User ID", value: user.id, inline: true },
          { name: "Timeout Duration", value: duration, inline: true },
          { name: "Reason", value: reason, inline: true },
        ],
        userId: user.id,
        timestamp: Date.now(),
      };

      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);

      interaction.reply({
        content: `**${user.tag}** has been timed out for ${duration}. Reason: ${reason}`,
      });
    } catch (error) {
      console.error("Error during timeout:", error);
      return interaction.reply({
        content: "An error occurred while trying to timeout the user.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};