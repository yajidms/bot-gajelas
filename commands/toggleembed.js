const { SlashCommandBuilder } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

const DEVELOPER_IDS = process.env.DEV_ID
  ? process.env.DEV_ID.split(",").map((id) => id.trim())
  : [];

let embedDetectionStatus = true;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toggleembed")
    .setDescription("[Developer Only] Toggle embed detection system")
    .addStringOption((option) =>
      option
        .setName("opsi")
        .setDescription("Embed detection system status") // Status sistem deteksi embed
        .setRequired(true)
        .addChoices({ name: "On", value: "on" }, { name: "Off", value: "off" })
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!DEVELOPER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content:
          "🚫 **Developer Access Required**\nThis command is for the development team only!", // 🚫 **Akses Developer Diperlukan**\nPerintah ini hanya untuk tim pengembang!
        ephemeral: true,
      });
    }

    try {
      const opsi = interaction.options.getString("opsi");
      const currentStatus = this.getEmbedDetectionStatus(); // Validasi status saat ini

      if (
        (opsi === "on" && currentStatus) ||
        (opsi === "off" && !currentStatus)
      ) {
        return interaction.reply({
          content: `⚠️ Embed detection system is already **${
            currentStatus ? "active" : "inactive"
          }**`, // ⚠️ Sistem deteksi embed sudah **${currentStatus ? "aktif" : "nonaktif"}**
          ephemeral: true,
        });
      } // Update status

      embedDetectionStatus = opsi === "on";
      const newStatus = this.getEmbedDetectionStatus(); // Response

      const statusText = newStatus ? "**ACTIVE** 🟢" : "**INACTIVE** 🔴"; // "**AKTIF** 🟢" : "**NONAKTIF** 🔴"
      await interaction.reply({
        content: `✅ **Embed Detection System**\nStatus: ${statusText}`, // ✅ **Sistem Deteksi Embed**\nStatus: ${statusText}
        ephemeral: true,
      }); // Logging

      console.log(
        `[SYSTEM] Embed detection set to: ${newStatus} by ${interaction.user.tag}`
      ); // `[SYSTEM] Embed detection set to: ${newStatus} by ${interaction.user.tag}`
      await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
        author: {
          name: `[SYSTEM] ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
        title: "EMBED DETECTION UPDATE", // "EMBED DETECTION UPDATE"
        description: [
          `**New Status**: ${newStatus ? "ACTIVE" : "INACTIVE"}`, // `**Status Baru**: ${newStatus ? "AKTIF" : "NONAKTIF"}`
          `**Changed By**: <@${interaction.user.id}>`, // `**Diubah Oleh**: <@${interaction.user.id}>`
          `**Environment**: \`${process.env.NODE_ENV || "development"}\``, // `**Environment**: \`${process.env.NODE_ENV || "development"}\``
        ].join("\n"),
        color: newStatus ? "#00FF00" : "#FF0000",
        fields: [
          { name: "Command", value: `\`/${this.data.name}\``, inline: true }, // "Perintah"
          {
            name: "Time",
            value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true,
          }, // "Waktu"
        ],
      });
    } catch (error) {
      console.error("[SYSTEM ERROR] Failed to update embed detection:", error); // "[SYSTEM ERROR] Gagal update deteksi embed:"
      await interaction.reply({
        content: "❌ **System Update Failed**\nAn internal error occurred!", // "❌ **Gagal Update Sistem**\nTerjadi kesalahan internal!"
        ephemeral: true,
      });
    }
  },

  getEmbedDetectionStatus: () => embedDetectionStatus,
};
