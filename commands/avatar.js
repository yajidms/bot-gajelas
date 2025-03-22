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
    .setDescription("Display your avatar or another member's avatar") // Tampilkan avatar Anda atau anggota lain
    .addUserOption((option) =>
      option
        .setName("member")
        .setDescription("Select a member (optional)") // Pilih anggota (opsional)
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetMember =
      interaction.options.getMember("member") || interaction.member;
    const avatarUrl = targetMember.displayAvatarURL({
      dynamic: true,
      size: 4096,
    });

    const avatarEmbed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle(`Avatar of ${targetMember.user.tag}`) // Avatar ${targetMember.user.tag}
      .setImage(avatarUrl);

    const viewAvatarButton = new ButtonBuilder()
      .setLabel("Open in Browser") // Buka di Browser
      .setStyle(ButtonStyle.Link)
      .setURL(avatarUrl);

    const actionRow = new ActionRowBuilder().addComponents(viewAvatarButton);

    await interaction.reply({
      embeds: [avatarEmbed],
      components: [actionRow],
    });
  },
};
