const { SlashCommandBuilder, MessageFlags } = require("discord.js");
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
        .setDescription("Embed detection system status")
        .setRequired(true)
        .addChoices({ name: "On", value: "on" }, { name: "Off", value: "off" })
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!DEVELOPER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content:
          "🚫 **Developer Access Required**\nThis command is for the development team only!",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const opsi = interaction.options.getString("opsi");
      const currentStatus = this.getEmbedDetectionStatus();

      if (
        (opsi === "on" && currentStatus) ||
        (opsi === "off" && !currentStatus)
      ) {
        return interaction.reply({
          content: `⚠️ Embed detection system is already **${
            currentStatus ? "active" : "inactive"
          }**`,
          flags: MessageFlags.Ephemeral,
        });
      } // Update status

      embedDetectionStatus = opsi === "on";
      const newStatus = this.getEmbedDetectionStatus();

      const statusText = newStatus ? "**ACTIVE** 🟢" :
      await interaction.reply({
        content: `✅ **Embed Detection System**\nStatus: ${statusText}`,
        flags: MessageFlags.Ephemeral,
      }); // Logging

      console.log(
        `[SYSTEM] Embed detection set to: ${newStatus} by ${interaction.user.tag}`
      ); // `[SYSTEM] Embed detection set to: ${newStatus} by ${interaction.user.tag}`
      await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
        author: {
          name: `[SYSTEM] ${interaction.user.tag}`,
          icon_url: interaction.user.displayAvatarURL(),
        },
        title: "EMBED DETECTION UPDATE",
        description: [
          `**New Status**: ${newStatus ? "ACTIVE" : "INACTIVE"}`,
          `**Changed By**: <@${interaction.user.id}>`,
          `**Environment**: \`${process.env.NODE_ENV || "development"}\``,
        ].join("\n"),
        color: newStatus ? "#00FF00" : "#FF0000",
        fields: [
          { name: "Command", value: `\`/${this.data.name}\``, inline: true },
          {
            name: "Time",
            value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true,
          },
        ],
      });
    } catch (error) {
      console.error("[SYSTEM ERROR] Failed to update embed detection:", error);
      await interaction.reply({
        content: "❌ **System Update Failed**\nAn internal error occurred!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },

  getEmbedDetectionStatus: () => embedDetectionStatus,
};