const { SlashCommandBuilder } = require('discord.js');

// Ambil ID developer dari environment variable
const DEVELOPER_IDS = process.env.DEV_ID 
  ? process.env.DEV_ID.split(',').map(id => id.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('[Developer Only] Restart bot system') // Deskripsi khusus developer
    .setDMPermission(false), // Nonaktifkan akses di DM

  async execute(interaction) {
    // 1. Cek akses developer
    if (!DEVELOPER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: '🚫 **System Restricted**\nThis command requires elevated privileges',
        ephemeral: true
      });
    }

    try {
      // 2. Kirim konfirmasi restart
      await interaction.reply({
        content: '🔄 **System Rebooting**\nBot akan restart dalam 3 detik...',
        ephemeral: true
      });

      // 3. Logging sebelum exit
      console.log(`[SYSTEM] Initiated restart by: ${interaction.user.tag}`);
      console.log('=== SHUTTING DOWN ===');

      // 4. Delay 3 detik sebelum exit
      setTimeout(() => {
        process.exit(0);
      }, 3000);

      // 5. Kirim log ke channel developer
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

    } catch (error) {
      console.error('[SYSTEM ERROR] Restart failure:', error);
      await interaction.editReply({
        content: '❌ **Reboot Failed**\nCheck system logs!',
        ephemeral: true
      });
    }
  },
};