const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const DEVELOPER_IDS = process.env.DEV_ID 
  ? process.env.DEV_ID.split(',').map(id => id.trim())
  : [];

const sendLog = async (client, channelId, embedData) => {
  try {
    const channel = await client.channels.fetch(channelId);
    const embed = new EmbedBuilder()
      .setColor(embedData.color || '#0099ff')
      .setTitle(embedData.title)
      .setDescription(embedData.description)
      .setAuthor(embedData.author)
      .addFields(embedData.fields)
      .setTimestamp();
    
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending log:', error);
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('[Developer Only] Restart bot system')
    .setDMPermission(false),

  async execute(interaction) {
    if (!DEVELOPER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: '🚫 **System Restricted**\nThis command requires elevated privileges',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      await interaction.reply({
        content: '🔄 **System Rebooting**\nBot akan restart dalam 3 detik...',
        flags: MessageFlags.Ephemeral
      });

      console.log(`[SYSTEM] Initiated restart by: ${interaction.user.tag}`);
      console.log('=== SHUTTING DOWN ===');

      await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
        author: {
          name: `[SYSTEM] ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL()
        },
        title: "SYSTEM REBOOT INITIATED",
        description: [
          "**Bot sedang melakukan restart**",
          `**Environment**: \`${process.env.NODE_ENV || "development"}\``,
          `**Executor**: <@${interaction.user.id}>`
        ].join("\n"),
        color: "#FFA500",
        fields: [
          { name: "Timestamp", value: `<t:${Math.floor(Date.now()/1000)}:R>` }
        ]
      });

      setTimeout(() => {
        process.exit(0);
      }, 3000);

    } catch (error) {
      console.error('[SYSTEM ERROR] Restart failure:', error);
      await interaction.editReply({
        content: '❌ **Reboot Failed**\nCheck system logs!',
        flags: MessageFlags.Ephemeral
      });
    }
  },
};