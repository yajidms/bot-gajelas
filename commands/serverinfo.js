const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays server information") // Menampilkan informasi server
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "This command can only be used within a server",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const { guild } = interaction;
      await guild.members.fetch(); // Fetch all members for accurate results // Fetch semua member untuk hasil yang akurat
      const owner = await guild.fetchOwner(); // Count channel types

      const channelTypes = {
        [ChannelType.GuildText]: 0,
        [ChannelType.GuildVoice]: 0,
        [ChannelType.GuildCategory]: 0,
      };

      guild.channels.cache.forEach((channel) => {
        if (channelTypes.hasOwnProperty(channel.type)) {
          channelTypes[channel.type]++;
        }
      }); // Create embed

      const serverinfoEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL({ size: 256 }),
        })
        .addFields(
          { name: "👑 Owner", value: owner.user.tag, inline: true }, // 👑 Pemilik
          {
            name: "📅 Created",
            value: guild.createdAt.toLocaleDateString(),
            inline: true,
          }, // 📅 Dibuat
          {
            name: "👥 Members",
            value: guild.memberCount.toString(),
            inline: true,
          }, // 👥 Member
          {
            name: "📚 Roles",
            value: guild.roles.cache.size.toString(),
            inline: true,
          }, // 📚 Roles
          {
            name: "📝 Text Channels",
            value: channelTypes[ChannelType.GuildText].toString(),
            inline: true,
          }, // 📝 Text Channels
          {
            name: "🎧 Voice Channels",
            value: channelTypes[ChannelType.GuildVoice].toString(),
            inline: true,
          }, // 🎧 Voice Channels
          {
            name: "🗂️ Categories",
            value: channelTypes[ChannelType.GuildCategory].toString(),
            inline: true,
          } // 🗂️ Kategori
        )
        .setFooter({
          text: `Server ID: ${guild.id}`,
        });

      await interaction.reply({ embeds: [serverinfoEmbed] });
    } catch (error) {
      console.error("Error serverinfo command:", error);
      await interaction.reply({
        content: "Failed to retrieve server information",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
