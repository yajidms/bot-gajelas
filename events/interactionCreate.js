const ALLOWED_GUILD_IDS = process.env.GUILD_ID
  ? process.env.GUILD_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  name: "interactionCreate",
  async execute(client, interaction) {
    if (!interaction.guild || !ALLOWED_GUILD_IDS.includes(interaction.guild.id))
      return;
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`Command ${interaction.commandName} tidak ditemukan!`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `Error saat mengeksekusi command ${interaction.commandName}:`,
        error
      );
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: "Terjadi kesalahan saat menjalankan perintah!",
        });
      } else {
        await interaction.reply({
          content: "Terjadi kesalahan saat menjalankan perintah!",
          ephemeral: true,
        });
      }
    }
  },
};
