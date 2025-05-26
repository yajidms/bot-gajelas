const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const ms = require("ms"); // Untuk parsing durasi seperti "10m", "1h", dsb.
const { sendLog } = require("../handlers/logHandler"); // Pastikan logHandler sudah diimport

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute a user.") // Memberikan mute kepada pengguna. -> Mute a user.
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to be muted.") // Pengguna yang akan di-mute. -> The user to be muted.
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("waktu")
        .setDescription("Mute duration (e.g., 10m, 1h).") // Durasi mute (contoh: 10m, 1h). -> Mute duration (e.g., 10m, 1h).
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("alasan")
        .setDescription("Reason for the mute.") // Alasan mute. -> Reason for the mute.
        .setRequired(false)
    ),

  async execute(interaction) {
    // Periksa izin pengguna -> Check user permissions
    if (
      !interaction.member.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      }); // Kamu tidak memiliki izin untuk menggunakan perintah ini. -> You do not have permission to use this command.
    }

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("waktu");
    const reason =
      interaction.options.getString("alasan") || "No reason provided."; // Tidak ada alasan yang diberikan. -> No reason provided.
    const mutedRole = interaction.guild.roles.cache.get(
      process.env.MUTED_ROLE_ID
    ); // Periksa apakah role mute ada -> Check if the mute role exists

    if (!mutedRole) {
      return interaction.reply({
        content: "Muted role not found.",
        ephemeral: true,
      }); // Role muted tidak ditemukan. -> Muted role not found.
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        ephemeral: true,
      }); // Pengguna tidak ditemukan di server ini. -> User not found in this server.
    }

    try {
      // Tambahkan role muted ke pengguna -> Add muted role to user
      await member.roles.add(mutedRole, reason);
      await interaction.reply({
        content: `**${user.tag}** has been muted. Reason: ${reason}`,
      }); // **${user.tag}** telah di-mute. Alasan: ${reason} -> **${user.tag}** has been muted. Reason: ${reason} // Kirimkan log ke channel log -> Send log to log channel

      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Muted", // User Muted
        description: `${user.tag} has been muted!`, // ${user.tag} telah di-mute! -> ${user.tag} has been muted!
        fields: [
          { name: "User ID", value: user.id, inline: true }, // ID User -> User ID
          { name: "Reason", value: reason, inline: true }, // Alasan -> Reason
        ],
        userId: user.id,
        timestamp: Date.now(),
      };

      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails); // Jika durasi diberikan, jadwalkan penghapusan role muted -> If duration is provided, schedule removal of muted role

      if (duration) {
        const muteDuration = ms(duration);
        if (muteDuration) {
          setTimeout(async () => {
            if (member.roles.cache.has(mutedRole.id)) {
              await member.roles.remove(mutedRole, "Mute expired."); // Mute selesai. -> Mute expired.
              await interaction.followUp({
                content: `**${user.tag}**'s mute has expired.`,
              }); // **${user.tag}** telah selesai di-mute. -> **${user.tag}**'s mute has expired. // Kirimkan log untuk unmute -> Send log for unmute

              const unmuteLogDetails = {
                author: {
                  name: user.tag,
                  icon_url: user.displayAvatarURL(),
                },
                title: "User Unmuted", // User Unmuted
                description: `${user.tag}'s mute has expired.`, // ${user.tag} telah selesai di-mute. -> ${user.tag}'s mute has expired.
                fields: [
                  { name: "User ID", value: user.id, inline: true }, // ID User -> User ID
                  { name: "Reason", value: "Mute expired", inline: true }, // Alasan -> Reason, Mute selesai -> Mute expired
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
      console.error("Error while muting:", error); // Error saat melakukan mute: -> Error while muting:
      return interaction.reply({
        content: "An error occurred while trying to mute the user.",
        ephemeral: true,
      }); // Terjadi kesalahan saat mencoba mem-mute pengguna. -> An error occurred while trying to mute the user.
    }
  },
};
