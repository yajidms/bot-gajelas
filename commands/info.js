const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Information about this bot."),
  async execute(interaction) {
    // Get bot avatar URL
    const botAvatar = interaction.client.user.displayAvatarURL({
      dynamic: true,
      format: "png",
      size: 512,
    });

    const infoEmbed = new EmbedBuilder()
      .setColor(0x00ffed)
      .setTitle("... Bot Information")
      .setDescription(
        "**... Bot** is a versatile assistant designed to maintain A Server. This bot can detect links from Reddit only then transform them into automatic embeds (but this discontinue for instagram and twitter now, replaced with downloader commands instead). Other features include **AI assistance** for information retrieval without going through a browser."
      ) //**Furina Bot** is a versatile assistant designed to maintain A Server. This bot can detect links from Reddit only then transform them into automatic embeds (but this discontinue for instgram and twitter now, replaced with downloader commands instead). Other features include **AI assistance** for information retrieval without going through a browser.
      .setThumbnail(botAvatar)
      .setFooter({ text: "Made with ❤️ by ..." })
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("platform-web") // Instagram
        .setURL("https://www...")
        .setStyle(ButtonStyle.Link)
        .setEmoji({ id: "id-discord" })
    // const buttons = new ActionRowBuilder().addComponents(
    //  new ButtonBuilder()
    //  .setLabel("Instagram") // Instagram
    //  .setURL("https://www.instagram.com/lucky_n3wbi3")
    //  .setStyle(ButtonStyle.Link)
    //  .setEmoji({ id: "1343986257528750091" }),
    //  new ButtonBuilder()
    //  .setLabel("GitHub")
    //  .setURL("https://github.com/yajidms/bot-gajelas")
    //  .setStyle(ButtonStyle.Link)
    //  .setEmoji({ id: "1368804727222960228" })
    );

    await interaction.reply({ embeds: [infoEmbed], components: [buttons] });
  },
};