const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Sends a message that you specify.") // Mengirimkan pesan yang Anda tentukan.
    .addStringOption((option) =>
      option
        .setName("pesan")
        .setDescription("The message that you want the bot to send.") // Pesan yang ingin dikirim oleh bot.
        .setRequired(true)
    ),
  async execute(interaction) {
    // Check if the user has ADMIN permission
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.", // Kamu tidak memiliki izin untuk menggunakan perintah ini.
        ephemeral: true,
      });
    }

    try {
      // Get message input from user
      const messageContent = interaction.options.getString("pesan"); // Send message to the same channel

      await interaction.channel.send(messageContent); // Notify that the message has been sent

      await interaction.reply({
        content: "Message sent successfully.", // Pesan berhasil dikirim.
        ephemeral: true, // Only the sender can see this reply // Hanya pengirim yang bisa melihat balasan ini
      });
    } catch (error) {
      console.error("Error while executing /say command:", error); // Error saat menjalankan perintah /say:
      await interaction.reply({
        content: "An error occurred while executing this command!", // Terjadi kesalahan saat menjalankan perintah ini!
        ephemeral: true,
      });
    }
  },
};
