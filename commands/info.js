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
    .setDescription("Information about this bot."), // Informasi tentang bot ini.
  async execute(interaction) {
    // Get bot avatar URL
    const botAvatar = interaction.client.user.displayAvatarURL({
      dynamic: true,
      format: "png",
      size: 512,
    }); // Create embed for bot information

    const infoEmbed = new EmbedBuilder()
      .setColor(0x00ffed)
      .setTitle("Ellen Bot Information") // Informasi Ellen Bot
      .setDescription(
        "✨ **Ellen Bot** is a versatile assistant designed to maintain A Server. This bot can detect links from Instagram, TikTok, X (Twitter), Reddit, and Ifunny, then transform them into automatic embeds. Other features include **AI assistance** for information retrieval without going through a browser."
      ) // ✨ **Ellen Bot** adalah asisten serbaguna yang dirancang untuk menjaga Suatu Server. Bot ini mampu mendeteksi tautan Instagram, TikTok, X (Twitter), Reddit, dan Ifunny, lalu merubahnya menjadi embed otomatis. Fitur lainnya meliputi **bantuan AI** untuk keperluan dalam mencari informasi tanpa melewati browser.
      .setThumbnail(botAvatar)
      .setFooter({ text: "Made with ❤️ by n3wbi3" })
      .setTimestamp(); // Create button for interaction

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Instagram") // Instagram
        .setURL("https://www.instagram.com/lucky_n3wbi3")
        .setStyle(ButtonStyle.Link)
        .setEmoji({ id: "1343986257528750091" })
    ); // Send embed and button to user

    await interaction.reply({ embeds: [infoEmbed], components: [buttons] }); // Mengirimkan embed dan button ke pengguna
  },
};

/*const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Informasi tentang bot ini.'),
    async execute(interaction) {
        // Ambil URL avatar bot
        const botAvatar = interaction.client.user.displayAvatarURL({ dynamic: true, format: 'png', size: 512 });

        // Membuat embed untuk informasi bot
        const infoEmbed = new EmbedBuilder()
            .setColor(0x00FFED)
            .setTitle('Informasi JFP Bot')
            .setDescription('✨ **JFP Bot** adalah asisten serbaguna yang dirancang untuk menjaga Server JFP. Bot ini mampu mendeteksi tautan Instagram, TikTok, X (Twitter), Reddit, dan Ifunny, lalu merubahnya menjadi embed otomatis. Fitur lainnya meliputi **bantuan AI** untuk keperluan dalam mencari informasi tanpa melewati browser.')
            .setThumbnail(botAvatar)
            .setFooter({ text: 'Made with ❤️ by n3wbi3' })
            .setTimestamp();

        // Membuat button untuk interaksi
        const buttons = new ActionRowBuilder()
            .addComponents(  
                new ButtonBuilder()
                    .setLabel('Instagram Utama')
                    .setURL('https://www.instagram.com/japanforpolban?igsh=MWppYnNhcWxydnk5eA==')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji({ id: '1343986257528750091' }), 
                new ButtonBuilder()
                    .setLabel('Instagram Divisi Budaya')
                    .setURL('https://www.instagram.com/jfp.cosu?igsh=MWlsYWR0NWQyc2VrZw==')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji({ id: '1343986257528750091' }),  
                new ButtonBuilder()
                    .setLabel('Instagram Divisi Manga')
                    .setURL('https://www.instagram.com/jfp.mangaclub?igsh=cDBrbmt0ajQ4ZmFh')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji({ id: '1343986257528750091' })  
            );

        // Mengirimkan embed dan button ke pengguna
        await interaction.reply({ embeds: [infoEmbed], components: [buttons] });
    },
};*/
