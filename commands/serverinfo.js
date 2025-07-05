const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays server information")
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
      await guild.members.fetch();
      const owner = await guild.fetchOwner();
      const channelTypes = {
        [ChannelType.GuildText]: 0,
        [ChannelType.GuildVoice]: 0,
        [ChannelType.GuildCategory]: 0,
      };

      guild.channels.cache.forEach((channel) => {
        if (channelTypes.hasOwnProperty(channel.type)) {
          channelTypes[channel.type]++;
        }
      });

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
          },
          {
            name: "👥 Members",
            value: guild.memberCount.toString(),
            inline: true,
          },
          {
            name: "📚 Roles",
            value: guild.roles.cache.size.toString(),
            inline: true,
          },
          {
            name: "📝 Text Channels",
            value: channelTypes[ChannelType.GuildText].toString(),
            inline: true,
          },
          {
            name: "🎧 Voice Channels",
            value: channelTypes[ChannelType.GuildVoice].toString(),
            inline: true,
          },
          {
            name: "🗂️ Categories",
            value: channelTypes[ChannelType.GuildCategory].toString(),
            inline: true,
          }
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
