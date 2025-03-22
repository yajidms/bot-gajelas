const { SlashCommandBuilder } = require("discord.js");
const { toggleAiStatus, getAiStatus } = require("../handlers/aiHandler");
const { sendLog } = require("../handlers/logHandler");

// Get developer IDs from environment variable
const DEVELOPER_IDS = process.env.DEV_ID
  ? process.env.DEV_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("toggleai")
    .setDescription("[Developer Only] Enable/disable AI feature") // [Developer Only] Aktifkan/nonaktifkan fitur AI
    .addStringOption((option) =>
      option
        .setName("opsi")
        .setDescription("AI Status") // Status AI
        .setRequired(true)
        .addChoices({ name: "On", value: "on" }, { name: "Off", value: "off" })
    ),

  async execute(interaction) {
    // 1. Check developer ID
    if (!DEVELOPER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content: "🚫 **Access Denied**\nThis command is for developers only!", // 🚫 **Akses Ditolak**\nPerintah ini hanya untuk developer!
        ephemeral: true,
      });
    } // 2. Process AI toggle

    const opsi = interaction.options.getString("opsi");
    const currentStatus = getAiStatus(); // 3. Validate status
    if (
      (opsi === "on" && currentStatus) ||
      (opsi === "off" && !currentStatus)
    ) {
      return interaction.reply({
        content: `⚠️ AI system is already **${
          currentStatus ? "active" : "inactive"
        }**`, // ⚠️ Sistem AI sudah dalam keadaan **${currentStatus ? "aktif" : "nonaktif"}**
        ephemeral: true,
      });
    } // 4. Update status

    toggleAiStatus(opsi === "on");
    const newStatus = getAiStatus(); // 5. Response to developer

    await interaction.reply({
      content: `✅ **AI Status Updated**\nAI system is now: **${
        newStatus ? "ACTIVE" : "INACTIVE"
      }**`, // ✅ **Status AI Diupdate**\nSistem AI sekarang: **${newStatus ? "AKTIF" : "NONAKTIF"}**
      ephemeral: true,
    }); // 6. Send log to dedicated channel

    await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
      author: {
        name: `[SYSTEM] ${interaction.user.tag}`,
        icon_url: interaction.user.displayAvatarURL(),
      },
      title: "AI SYSTEM STATUS CHANGED", // "AI SYSTEM STATUS CHANGED"
      description: [
        `**Action**: \`TOGGLE AI\``, // `**Action**: \`TOGGLE AI\``
        `**New Status**: ${newStatus ? "🟢 ACTIVE" : "🔴 INACTIVE"}`, // `**New Status**: ${newStatus ? "🟢 ACTIVE" : "🔴 INACTIVE"}`
        `**Executor**: <@${interaction.user.id}>`, // `**Executor**: <@${interaction.user.id}>`
        `**Environment**: \`${process.env.NODE_ENV || "development"}\``, // `**Environment**: \`${process.env.NODE_ENV || "development"}\``
      ].join("\n"),
      color: newStatus ? "#00FF00" : "#FF0000",
    });
  },
};
