const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("View user profile avatar")
    .addUserOption((option) =>
      option.setName("user").setDescription("Select a user").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Choose avatar type")
        .addChoices(
          { name: "Global", value: "global" },
          { name: "Server", value: "server" }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    const targetMember =
      interaction.options.getMember("user") || interaction.member;
    const avatarType = interaction.options.getString("type");

    // Fungsi untuk mendapatkan avatar dan memeriksa apakah GIF (pusing disini anjir)
    const getAvatarInfo = (user, isServer = false) => {
      const avatarHash = isServer
        ? targetMember?.avatar // Gunakan optional chaining 
        : user.avatar;

      if (!avatarHash) {
        if (!isServer) {
          // Default avatar baru (tanpa discriminator, karena Discord sudah hapus sistem discriminator)
          const defaultAvatarNumber = user.id % 5;
          const defaultAvatarURL = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
          return { url: defaultAvatarURL, isAnimated: false };
        }
        return { url: null, isAnimated: false };
      }

      // Periksa format animasi (a_ ya itu tuh harus ditambah ajig)
      const isAnimated = avatarHash.startsWith("a_");

      
      let avatarURL;

      if (isServer) {
        
        if (!interaction.guild) return { url: null, isAnimated: false };

        // Format URL avatar server
        const serverAvatarExtension = isAnimated ? "gif" : "png";
        avatarURL = `https://cdn.discordapp.com/guilds/${interaction.guild.id}/users/${user.id}/avatars/${avatarHash}.${serverAvatarExtension}?size=4096`;
      } else {
        // Format URL avatar global
        const globalAvatarExtension = isAnimated ? "gif" : "png";
        avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${globalAvatarExtension}?size=4096`;
      }

      return { url: avatarURL, isAnimated };
    };

    
    const globalAvatarInfo = getAvatarInfo(targetUser);
    const serverAvatarInfo = targetMember?.avatar
      ? getAvatarInfo(targetUser, true)
      : null;

    // Siapkan embed dan tombol
    const embeds = [];
    const buttons = [];

    // Handle tipe avatar
    const handleAvatar = (type, avatarInfo) => {
      if (!avatarInfo || !avatarInfo.url) return;

      embeds.push(
        createEmbed(targetUser, type, avatarInfo.url, avatarInfo.isAnimated)
      );
      buttons.push(
        createButton(`${type} Avatar`, avatarInfo.url, avatarInfo.isAnimated)
      );
    };

    // Tentukan avatar mana yang akan ditampilkan berdasarkan tipe yang dipilih
    if (avatarType === "server") {
      if (!serverAvatarInfo || !serverAvatarInfo.url) {
        return interaction.reply({
          content: "❌ User doesn't have a server avatar!",
          ephemeral: true,
        });
      }
      handleAvatar("Server", serverAvatarInfo);
    } else if (avatarType === "global") {
      handleAvatar("Global", globalAvatarInfo);
    } else {
      // Jika tidak ada tipe yang dipilih, tampilkan keduanya
      handleAvatar("Global", globalAvatarInfo);
      if (serverAvatarInfo && serverAvatarInfo.url)
        handleAvatar("Server", serverAvatarInfo);
    }

    const actionRow = new ActionRowBuilder().addComponents(buttons);

    await interaction.reply({
      embeds: embeds,
      components: buttons.length > 0 ? [actionRow] : [],
    });
  },
};
// Fungsi pembantu embed
function createEmbed(user, type, url, isAnimated) {
  return new EmbedBuilder()
    .setColor("#5865F2")
    .setTitle(`${user.tag} - ${type} Avatar`)
    .setImage(url)
    .setFooter({
      text: isAnimated ? "🎬 Animated Avatar" : "🖼 Static Avatar",
    });
}
// Fungsi pembantu tombol
function createButton(label, url, isAnimated) {
  return new ButtonBuilder()
    .setLabel(`${label} ${isAnimated ? "🎬" : "🖼"}`)
    .setStyle(ButtonStyle.Link)
    .setURL(url);
}
