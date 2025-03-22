const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays a list of all commands."), // Menampilkan daftar semua perintah.
  async execute(interaction) {
    // Create embed for command list
    const commandsList = interaction.client.commands
      .map((cmd) => `**/${cmd.data.name}**: ${cmd.data.description}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x00ffed)
      .setTitle("Command List") // Daftar Perintah
      .setDescription(
        `Here is a list of available commands:\n\n${commandsList}`
      ) // Berikut adalah daftar perintah yang tersedia:\n\n${commandsList}
      .setFooter({ text: "Use these commands to interact with the bot" }) // Gunakan perintah ini untuk berinteraksi dengan bot
      .setTimestamp(); // Send embed as a response that is only visible to the user who sent the command

    await interaction.reply({
      embeds: [embed],
      ephemeral: true, // Message is only visible to the command sender // Pesan hanya bisa dilihat oleh pengirim perintah
    });
  },
};
