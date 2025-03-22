const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot and API latency')
    .setDMPermission(true),

  async execute(interaction) {
    try {
      // 1. Defer the reply untuk menghitung latency
      await interaction.deferReply();
      
      // 2. Hitung latency bot dan API
      const reply = await interaction.fetchReply();
      const botLatency = reply.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      // 3. Buat embed
      const pingEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'Bot Latency', value: `\`${botLatency}ms\``, inline: true },
          { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true }
        )
        .setTimestamp();

      // 4. Update deferred reply dengan embed
      await interaction.editReply({ embeds: [pingEmbed] });

    } catch (error) {
      console.error('Ping command error:', error);
      
      // 5. Error handling yang lebih robust
      const errorMessage = '❌ Failed to check latency';
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ 
          content: errorMessage, 
          ephemeral: true 
        });
      }
    }
  },
};