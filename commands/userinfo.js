const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays user information") // Menampilkan informasi pengguna
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to view information about") // Pilih pengguna yang ingin dilihat informasinya
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ This command can only be used within a server", // ❌ Command ini hanya bisa digunakan di dalam server
        ephemeral: true,
      });
    }

    try {
      const user = interaction.options.getUser("user") || interaction.user;
      const member = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);

      if (!member) {
        return interaction.reply({
          content: "⚠️ User not found in this server", // ⚠️ Pengguna tidak ditemukan di server ini
          ephemeral: true,
        });
      }

      const roles =
        member.roles.cache
          .filter((role) => role.id !== interaction.guild.id)
          .map((role) => `<@&${role.id}>`)
          .join(", ") || "No roles"; // Tidak ada role

      const userinfoEmbed = new EmbedBuilder()
        .setColor("#3498db")
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL({ size: 256 }),
        })
        .setThumbnail(member.user.displayAvatarURL({ size: 512 }))
        .addFields(
          { name: "🆔 User ID", value: member.id, inline: true }, // 🆔 User ID
          {
            name: "📅 Account Created",
            value: member.user.createdAt.toLocaleDateString(),
            inline: true,
          }, // 📅 Akun Dibuat
          {
            name: "📥 Joined Server",
            value: member.joinedAt.toLocaleDateString(),
            inline: true,
          }, // 📥 Join Server
          {
            name: "🎭 Roles",
            value: roles.length > 1024 ? "Too many roles" : roles,
          } // 🎭 Roles, Terlalu banyak roles
        )
        .setFooter({
          text: `Requested by ${interaction.user.tag}`, // Diminta oleh ${interaction.user.tag}
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.reply({ embeds: [userinfoEmbed] });
    } catch (error) {
      console.error("Error userinfo command:", error);
      await interaction.reply({
        content: "❌ Failed to retrieve user information", // ❌ Gagal mengambil informasi pengguna
        ephemeral: true,
      });
    }
  },
};
