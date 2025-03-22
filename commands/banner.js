const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("View user profile banner") // Lihat banner profil pengguna
    .addUserOption(
      (option) =>
        option
          .setName("user")
          .setDescription("Select a user")
          .setRequired(false) // Pilih pengguna
    ),

  async execute(interaction) {
    try {
      // 1. Get target user
      const targetUser =
        interaction.options.getUser("user") || interaction.user; // 2. Fetch full user data (including banner)

      const fullUser = await interaction.client.users.fetch(targetUser.id, {
        force: true,
      }); // 3. Check if user has a banner

      const bannerURL = fullUser.bannerURL({
        dynamic: true,
        size: 4096,
      });

      if (!bannerURL) {
        return interaction.reply({
          content: `**${fullUser.tag}** does not have a profile banner ${
            // **${fullUser.tag}** tidak memiliki banner profil
            fullUser.accentColor ? "(although they have an accent color)" : "" // "(walau memiliki warna aksen)"
          }`,
          ephemeral: true,
        });
      } // 4. Create embed with banner

      const bannerEmbed = new EmbedBuilder()
        .setColor(fullUser.accentColor || "#5865F2")
        .setTitle(`Banner of ${fullUser.tag}`) // Banner ${fullUser.tag}
        .setImage(bannerURL)
        .setFooter({ text: "Banner is available for Nitro users only" }); // Banner hanya tersedia untuk pengguna Nitro // 5. Create button to open in browser

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Open in Browser") // Buka di Browser
          .setStyle(ButtonStyle.Link)
          .setURL(bannerURL)
      ); // 6. Send result

      await interaction.reply({
        embeds: [bannerEmbed],
        components: [row],
      });
    } catch (error) {
      console.error("Banner command error:", error);
      await interaction.reply({
        content:
          'Failed to fetch banner data. Make sure the bot has the "User Info Access" permission!', // Gagal mengambil data banner. Pastikan bot memiliki permission "Akses Informasi Pengguna"!
        ephemeral: true,
      });
    }
  },
};
