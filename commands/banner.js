const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("View user profile banner")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select a user").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Choose banner type")
        .addChoices(
          { name: "Global", value: "global" },
          { name: "Server", value: "server" }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      const targetUser =
        interaction.options.getUser("user") || interaction.user;
      const bannerType = interaction.options.getString("type");
      const member =
        interaction.options.getMember("user") || interaction.member;

      // Fetch full user data
      const fullUser = await interaction.client.users.fetch(targetUser.id, {
        force: true,
      });

      // Fungsi untuk mendapatkan banner dan memeriksa apakah GIF
      const getBannerInfo = (user, isServer = false) => {
        if (isServer && !interaction.guild)
          return { url: null, isAnimated: false }; // Tambahkan ini

        const bannerHash = isServer ? member?.banner : user.banner;
        if (!bannerHash) return { url: null, isAnimated: false };

        const isAnimated = bannerHash.startsWith("a_");
        let bannerURL;

        if (isServer) {
          const serverBannerExtension = isAnimated ? "gif" : "png";
          const serverBannerID = member.banner;
          bannerURL = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${member.id}/banners/${serverBannerID}.${serverBannerExtension}?size=4096`;
        } else {
          const globalBannerExtension = isAnimated ? "gif" : "png";
          bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${bannerHash}.${globalBannerExtension}?size=4096`;
        }

        return { url: bannerURL, isAnimated };
      };

      // Dapatkan informasi banner
      const globalBannerInfo = getBannerInfo(fullUser);
      const serverBannerInfo = member ? getBannerInfo(fullUser, true) : null;

      // Siapkan embed dan tombol
      const embeds = [];
      const buttons = [];

      // Handle tipe banner
      const handleBanner = (type, bannerInfo) => {
        if (!bannerInfo || !bannerInfo.url) return;

        embeds.push(
          createBannerEmbed(
            fullUser,
            type,
            bannerInfo.url,
            bannerInfo.isAnimated
          )
        );
        buttons.push(
          createBannerButton(
            `${type} Banner`,
            bannerInfo.url,
            bannerInfo.isAnimated
          )
        );
      };

      if (bannerType === "server") {
        if (!serverBannerInfo || !serverBannerInfo.url) {
          return interaction.reply({
            content: "❌ User doesn't have a server banner!",
            flags: MessageFlags.Ephemeral,
          });
        }
        handleBanner("Server", serverBannerInfo);
      } else if (bannerType === "global") {
        if (!globalBannerInfo || !globalBannerInfo.url) {
          return interaction.reply({
            content: "❌ User doesn't have a global banner!",
            flags: MessageFlags.Ephemeral,
          });
        }
        handleBanner("Global", globalBannerInfo);
      } else {
        // Jika tidak ada tipe yang dipilih, tampilkan keduanya
        handleBanner("Global", globalBannerInfo);
        handleBanner("Server", serverBannerInfo);
      }

      // Error handling jika tidak ada banner
      if (embeds.length === 0) {
        return interaction.reply({
          content: "❌ User doesn't have any banners!",
          flags: MessageFlags.Ephemeral,
        });
      }

      const actionRow = new ActionRowBuilder().addComponents(buttons);

      await interaction.reply({
        embeds: embeds,
        components: buttons.length > 0 ? [actionRow] : [],
      });
    } catch (error) {
      console.error("Banner command error:", error);
      await interaction.reply({
        content: "Failed to fetch banner data. Please check bot permissions!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

function createBannerEmbed(user, type, url, isAnimated) {
  return new EmbedBuilder()
    .setColor(user.accentColor || "#5865F2")
    .setTitle(`${user.tag} - ${type} Banner`)
    .setImage(url)
    .setFooter({
      text: isAnimated ? "🎬 Animated Banner" : "🖼 Static Banner",
    });
}

function createBannerButton(label, url, isAnimated) {
  return new ButtonBuilder()
    .setLabel(`${label} ${isAnimated ? "🎬" : "🖼"}`)
    .setStyle(ButtonStyle.Link)
    .setURL(url);
}
