const { SlashCommandBuilder, ActivityType, MessageFlags } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

const DEVELOPER_IDS = process.env.DEV_ID
  ? process.env.DEV_ID.split(",").map((id) => id.trim())
  : [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set")
    .setDescription("[Developer Only] Manage bot settings")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription(
          "[Developer Only] Set temporary or permanent bot status"
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("The type of status to set")
            .setRequired(true)
            .addChoices(
              { name: "Online", value: "online" },
              { name: "Idle", value: "idle" },
              { name: "Do Not Disturb", value: "dnd" },
              { name: "Invisible", value: "invisible" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Custom status text to display")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("How long should this status last?")
            .setRequired(true)
            .addChoices(
              { name: "Today", value: "today" },
              { name: "4 hours", value: "4h" },
              { name: "1 hour", value: "1h" },
              { name: "30 minutes", value: "30m" },
              { name: "Permanent (Don't Clear)", value: "dont_clear" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("activity")
        .setDescription(
          "[Developer Only] Set temporary or permanent bot activity"
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("The type of activity to set")
            .setRequired(true)
            .addChoices(
              { name: "Playing", value: "PLAYING" },
              { name: "Listening", value: "LISTENING" },
              { name: "Watching", value: "WATCHING" },
              { name: "Streaming", value: "STREAMING" }
            )
        )
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("Activity text to display")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("How long should this activity last?")
            .setRequired(true)
            .addChoices(
              { name: "Today", value: "today" },
              { name: "4 hours", value: "4h" },
              { name: "1 hour", value: "1h" },
              { name: "30 minutes", value: "30m" },
              { name: "Permanent (Don't Clear)", value: "dont_clear" }
            )
        )
    ),

  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (!DEVELOPER_IDS.includes(interaction.user.id)) {
      return interaction.reply({
        content:
          "🚫 **System Restricted**\nThis command requires developer privileges",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const subcommand = interaction.options.getSubcommand();
      const duration = interaction.options.getString("duration");
      let timeoutDuration = null;

      if (duration === "today") timeoutDuration = getTimeUntilMidnight();
      if (duration === "4h") timeoutDuration = 4 * 60 * 60 * 1000;
      if (duration === "1h") timeoutDuration = 1 * 60 * 60 * 1000;
      if (duration === "30m") timeoutDuration = 30 * 60 * 1000;

      if (subcommand === "status") {
        const type = interaction.options.getString("type");
        const message = interaction.options.getString("message");

        await interaction.client.user.setPresence({
          status: type,
          activities: [
            {
              type: ActivityType.Custom,
              name: "Custom Status",
              state: message,
            },
          ],
        });

        if (timeoutDuration) {
          setTimeout(async () => {
            await interaction.client.user.setPresence({
              status: "online",
              activities: [],
            });
          }, timeoutDuration);
        }

        await interaction.reply({
          content: `✅ Bot status successfully set to **${type}** with custom status: **"${message}"** for **${getReadableDuration(
            duration
          )}**`,
          flags: MessageFlags.Ephemeral,
        });

        await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
          author: {
            name: `[SYSTEM] ${interaction.user.tag}`,
            icon_url: interaction.user.displayAvatarURL(),
          },
          title: "BOT STATUS UPDATED",
          description: [
            "**New Status Configuration**",
            `• Status Type: \`${type.toUpperCase()}\``,
            `• Status Message: \`${message || "None"}\``,
            `• Duration: \`${getReadableDuration(duration)}\``,
            `• Environment: \`${process.env.NODE_ENV || "development"}\``,
          ].join("\n"),
          color: "#00FFFF",
          fields: [
            { name: "Developer", value: `<@${interaction.user.id}>` },
            {
              name: "Timestamp",
              value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
            },
          ],
        });
      } else if (subcommand === "activity") {
        const activity = interaction.options.getString("type");
        const message = interaction.options.getString("message");

        const activityTypeMap = {
          PLAYING: ActivityType.Playing,
          LISTENING: ActivityType.Listening,
          WATCHING: ActivityType.Watching,
          STREAMING: ActivityType.Streaming,
        };

        await interaction.client.user.setPresence({
          status: "online",
          activities: [{ name: message, type: activityTypeMap[activity] }],
        });

        if (timeoutDuration) {
          setTimeout(async () => {
            await interaction.client.user.setPresence({
              status: "online",
              activities: [],
            });
          }, timeoutDuration);
        }

        await interaction.reply({
          content: `✅ Bot activity successfully set to **${activity.toLowerCase()}** for **${getReadableDuration(
            duration
          )}** with message **"${message}"**`,
          flags: MessageFlags.Ephemeral,
        });

        await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
          author: {
            name: `[SYSTEM] ${interaction.user.tag}`,
            icon_url: interaction.user.displayAvatarURL(),
          },
          title: "BOT ACTIVITY UPDATED",
          description: [
            "**New Activity Configuration**",
            `• Activity Type: \`${activity}\``,
            `• Activity Message: \`${message || "None"}\``,
            `• Duration: \`${getReadableDuration(duration)}\``,
            `• Environment: \`${process.env.NODE_ENV || "development"}\``,
          ].join("\n"),
          color: "#00FFFF",
          fields: [
            { name: "Developer", value: `<@${interaction.user.id}>` },
            {
              name: "Timestamp",
              value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
            },
          ],
        });
      }
    } catch (error) {
      console.error("[SYSTEM ERROR] Failed to update presence:", error);
      await sendLog(interaction.client, process.env.DEV_LOG_CHANNEL_ID, {
        author: {
          name: `[SYSTEM] ERROR`,
          icon_url: interaction.client.user.displayAvatarURL(),
        },
        title: "BOT PRESENCE UPDATE FAILED",
        description: `**Error Details:**\n\`\`\`${error.message}\`\`\``,
        color: "#FF0000",
        fields: [
          { name: "Developer", value: `<@${interaction.user.id}>` },
          {
            name: "Timestamp",
            value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
          },
        ],
      });
      await interaction.reply({
        content: "❌ **System Update Failed**\nCheck console for details",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(23, 59, 59, 999);
  return midnight - now;
}

function getReadableDuration(duration) {
  const durationMap = {
    today: "until midnight",
    "4h": "4 hours",
    "1h": "1 hour",
    "30m": "30 minutes",
    dont_clear: "permanent",
  };
  return durationMap[duration] || "unknown duration";
}
