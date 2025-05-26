const { SlashCommandBuilder } = require("@discordjs/builders");
const { PermissionsBitField } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the server.") // Mengeluarkan pengguna dari server.
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to be kicked.") // Pengguna yang akan dikeluarkan.
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("alasan")
        .setDescription("Reason for the kick.") // Alasan kick.
        .setRequired(false)
    )
    .setDefaultPermission(true), // Tampilkan command untuk semua pengguna -> Show command for all users

  async execute(interaction) {
    // Periksa izin pengguna -> Check user permissions
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      }); // Kamu tidak memiliki izin untuk menggunakan perintah ini.
    }

    const user = interaction.options.getUser("user");
    const reason =
      interaction.options.getString("alasan") || "No reason provided."; // Tidak ada alasan yang diberikan.
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "User not found in this server.",
        ephemeral: true,
      }); // Pengguna tidak ditemukan di server ini.
    }

    try {
      await member.kick(reason);
      const logDetails = {
        author: {
          name: user.tag,
          icon_url: user.displayAvatarURL(),
        },
        title: "User Kicked", // User Kicked
        description: `${user.tag} has been kicked!`, // ${user.tag} telah dikeluarkan!
        fields: [
          { name: "User ID", value: user.id, inline: true }, // ID User
          { name: "Reason", value: reason, inline: true }, // Alasan
        ],
        userId: user.id,
        timestamp: Date.now(),
      };
      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);

      interaction.reply({
        content: `**${user.tag}** successfully kicked. Reason: ${reason}`,
      }); // **${user.tag}** berhasil dikeluarkan. Alasan: ${reason}
    } catch (error) {
      console.error("Error while kicking:", error); // Error saat melakukan kick:
      return interaction.reply({
        content: "An error occurred while trying to kick the user.",
        ephemeral: true,
      }); // Terjadi kesalahan saat mencoba mengeluarkan pengguna.
    }
  },
};
