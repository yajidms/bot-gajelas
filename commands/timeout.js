const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const ms = require("ms");
const { sendLog } = require("../handlers/logHandler"); // Ensure logHandler is imported

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Times out a user.") // Description in English
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to timeout.") // Description in English
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("duration") // Changed "waktu" to "duration" for clarity
        .setDescription("Timeout duration (e.g., 10m, 1h).") // Description in English
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Timeout reason.")
        .setRequired(false)
    ),

  async execute(interaction) {
    // Check user permissions
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.ModerateMembers
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("duration"); // Changed "waktu" to "duration"
    const reason =
      interaction.options.getString("reason") || "No reason provided."; // Changed default reason
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        ephemeral: true,
      });
    }

    try {
      const timeoutDuration = ms(duration);
      await member.timeout(timeoutDuration, reason);

      // Send log to the log channel
      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Timed Out",
        description: `${user.tag} has been timed out.`, // Description in English
        fields: [
          { name: "User ID", value: user.id, inline: true }, // Field name in English
          { name: "Timeout Duration", value: duration, inline: true }, // Field name in English
          { name: "Reason", value: reason, inline: true }, // Field name in English
        ],
        userId: user.id,
        timestamp: Date.now(),
      };

      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);

      interaction.reply({
        content: `**${user.tag}** has been timed out for ${duration}. Reason: ${reason}`,
      }); // Response in English
    } catch (error) {
      console.error("Error during timeout:", error); // Error message in English
      return interaction.reply({
        content: "An error occurred while trying to timeout the user.",
        ephemeral: true,
      }); // Error message in English
    }
  },
};
