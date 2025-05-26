const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a specific user.") // Deskripsi dalam bahasa Inggris
    .addStringOption((option) =>
      option
        .setName("user_id")
        .setDescription("The user ID to unban.") // Deskripsi dalam bahasa Inggris
        .setRequired(true)
    )
    .setDefaultPermission(true), // Tampilkan command untuk semua pengguna

  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      }); // Pesan dalam bahasa Inggris
    }

    const userId = interaction.options.getString("user_id");

    try {
      const banList = await interaction.guild.bans.fetch();
      const isBanned = banList.has(userId);

      if (!isBanned) {
        return interaction.reply({
          content: `User with ID **${userId}** was not found in the ban list.`, // Pesan dalam bahasa Inggris
          ephemeral: true,
        });
      }

      await interaction.guild.members.unban(userId);
      await interaction.reply({
        content: `User with ID **${userId}** has been successfully unbanned.`,
      }); // Pesan dalam bahasa Inggris

      const logDetails = {
        author: {
          name: interaction.user.tag,
          icon_url: interaction.user.displayAvatarURL(),
        },
        title: "User Unbanned", // Judul log dalam bahasa Inggris
        description: `User with ID **${userId}** has been unbanned.`, // Deskripsi log dalam bahasa Inggris
        fields: [
          { name: "User ID", value: userId, inline: true }, // Nama field dalam bahasa Inggris
          {
            name: "Admin yang Melakukan",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
        ],
        userId: interaction.user.id,
        timestamp: Date.now(),
      };
      sendLog(interaction.client, process.env.LOG_CHANNEL_ID, logDetails);
    } catch (error) {
      console.error("Error saat membuka ban:", error);
      await interaction.reply({
        content: `An error occurred while trying to unban. Make sure the user ID is valid and the user is actually banned.`, // Pesan dalam bahasa Inggris
        ephemeral: true,
      });
    }
  },
};
