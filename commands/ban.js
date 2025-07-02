const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField, MessageFlags } = require("discord.js");
const ms = require("ms");
const { sendLog } = require("../handlers/logHandler"); // Pastikan logHandler sudah diimport

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user.") // Melakukan ban kepada pengguna.
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to be banned.") // Pengguna yang akan di-ban.
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("waktu")
        .setDescription("Ban duration (e.g., 7d, 1h).") // Durasi ban (contoh: 7d, 1h).
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("alasan")
        .setDescription("Reason for the ban.") // Alasan ban.
        .setRequired(false)
    ),

  async execute(interaction) {
    // Periksa izin pengguna
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        flags: MessageFlags.Ephemeral,
      }); // Kamu tidak memiliki izin untuk menggunakan perintah ini.
    }

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("waktu");
    const reason =
      interaction.options.getString("alasan") || "No reason provided."; // Tidak ada alasan yang diberikan.
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        flags: MessageFlags.Ephemeral,
      }); // Pengguna tidak ditemukan di server ini.
    }

    try {
      await member.ban({ reason }); // Kirimkan log ke channel log

      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Banned", // User Banned
        description: `${user.tag} has been banned!`, // ${user.tag} telah dibanned!
        fields: [
          { name: "User ID", value: user.id, inline: true }, // ID User
          { name: "Reason", value: reason, inline: true }, // Alasan
        ],
        userId: user.id,
        timestamp: Date.now(),
      };

      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);

      interaction.reply({
        content: `**${user.tag}** has been banned. Reason: ${reason}`,
      }); // **${user.tag}** telah di-ban. Alasan: ${reason} // Jika durasi diberikan, jadwalkan pembatalan ban

      if (duration) {
        const banDuration = ms(duration);
        if (banDuration) {
          setTimeout(async () => {
            await interaction.guild.members.unban(user.id, "Ban expired."); // Ban selesai.
            interaction.followUp({
              content: `**${user.tag}**'s ban has expired.`,
            }); // **${user.tag}** telah selesai di-ban.
          }, banDuration);
        }
      }
    } catch (error) {
      console.error("Error while banning:", error); // Error saat melakukan ban:
      return interaction.reply({
        content: "An error occurred while trying to ban the user.",
        flags: MessageFlags.Ephemeral,
      }); // Terjadi kesalahan saat mencoba mem-ban pengguna.
    }
  },
};
