const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot and API latency")
    .setDMPermission(true),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const reply = await interaction.fetchReply();
      const botLatency = reply.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      const pingEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🏓 Pong!")
        .addFields(
          { name: "Bot Latency", value: `\`${botLatency}ms\``, inline: true },
          { name: "API Latency", value: `\`${apiLatency}ms\``, inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [pingEmbed] });
    } catch (error) {
      console.error("Ping command error:", error);

      const errorMessage = "❌ Failed to check latency";

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({
          content: errorMessage,
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};