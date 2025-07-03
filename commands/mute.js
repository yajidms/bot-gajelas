const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const ms = require("ms");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to be muted.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("waktu")
        .setDescription("Mute duration (e.g., 10m, 1h).")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("alasan")
        .setDescription("Reason for the mute.")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("time");
    const reason =
      interaction.options.getString("alasan") || "No reason provided.";
    const mutedRole = interaction.guild.roles.cache.get(
      process.env.MUTED_ROLE_ID
    );

    if (!mutedRole) {
      return interaction.reply({
        content: "Muted role not found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await member.roles.add(mutedRole, reason);
      await interaction.reply({
        content: `**${user.tag}** has been muted. Reason: ${reason}`,
      });

      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Muted",
        description: `${user.tag} has been muted!`,
        fields: [
          { name: "User ID", value: user.id, inline: true },
          { name: "Reason", value: reason, inline: true },
        ],
        userId: user.id,
        timestamp: Date.now(),
      };

      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);

      if (duration) {
        const muteDuration = ms(duration);
        if (muteDuration) {
          setTimeout(async () => {
            if (member.roles.cache.has(mutedRole.id)) {
              await member.roles.remove(mutedRole, "Mute expired.");
              await interaction.followUp({
                content: `**${user.tag}**'s mute has expired.`,
              });

              const unmuteLogDetails = {
                author: {
                  name: user.tag,
                  icon_url: user.displayAvatarURL(),
                },
                title: "User Unmuted", // User Unmuted
                description: `${user.tag}'s mute has expired.`,
                fields: [
                  { name: "User ID", value: user.id, inline: true },
                  { name: "Reason", value: "Mute expired", inline: true },
                ],
                userId: user.id,
                timestamp: Date.now(),
              };

              sendLog(
                interaction.client,
                process.env.LOG_CHANNEL_ID,
                unmuteLogDetails
              );
            }
          }, muteDuration);
        }
      }
    } catch (error) {
      console.error("Error while muting:", error);
      return interaction.reply({
        content: "An error occurred while trying to mute the user.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
