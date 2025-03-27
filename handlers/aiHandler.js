const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { sendLog } = require("./logHandler");

let aiStatus = true;
const allowedChannels = process.env.ALLOWED_AI_CHANNELS.split(",");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

module.exports = {
  handleAiChat: async (message) => {
    const prefix = "f.ai";
    if (!message.content.startsWith(prefix)) return;

    const userQuestion = message.content.slice(prefix.length).trim();
    if (!userQuestion)
      return message.reply({
        content: "Please write down the issue you want to ask after `f.ai`.",
        allowedMentions: { repliedUser: false },
      });

    if (
      !aiStatus &&
      !message.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return message.reply({
        content:
          "AI feature is currently disabled. Contact admin to enable this feature.",
        allowedMentions: { repliedUser: false },
      });
    }

    const isInAllowedChannel = allowedChannels.includes(message.channel.id);
    const isInThread = message.channel.isThread();
    const threadParentId = isInThread ? message.channel.parentId : null;
    const isInAllowedThread =
      isInAllowedChannel ||
      (isInThread && allowedChannels.includes(threadParentId));

    if (
      !isInAllowedChannel &&
      !isInAllowedThread &&
      !message.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      const allowedChannelTags = allowedChannels
        .map((channelId) => `<#${channelId}>`)
        .join(", ");

      const replyMessage = await message.reply({
        content: `This feature can only be used in channels or threads ${allowedChannelTags}`,
        allowedMentions: { repliedUser: false },
      });

      setTimeout(async () => {
        try {
          await message.delete();
          await replyMessage.delete();
        } catch (error) {
          const logFields = [
            {
              name: "Error Message",
              value: error.message || "No error message",
              inline: false,
            },
          ];

          if (isInThread) {
            logFields.push(
              {
                name: "Channel",
                value: `#${message.channel.parent.name}`,
                inline: true,
              },
              {
                name: "Thread",
                value: `#${message.channel.name}`,
                inline: true,
              }
            );
          } else {
            logFields.push({
              name: "Channel",
              value: `#${message.channel.name}`,
              inline: true,
            });
          }

          await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
            author: {
              name: message.client.user.tag,
              icon_url: message.client.user.displayAvatarURL(),
            },
            title: "Error deleting message",
            description: "Failed to delete message or command",
            fields: logFields,
            timestamp: Date.now(),
          });
        }
      }, 5000);
      return;
    }

    try {
      const response = await model.generateContent(userQuestion);
      let answer = response.response.text();

      if (!answer) throw new Error("AI returned empty response");

      // Split answer into 4096 character chunks
      const answerParts = [];
      while (answer.length > 0) {
        answerParts.push(answer.substring(0, 4096));
        answer = answer.substring(4096);
      }

      // Filter empty parts
      const filteredParts = answerParts.filter(
        (part) => part.trim().length > 0
      );
      if (filteredParts.length === 0)
        throw new Error("No valid content generated");

      let lastMessage;
      const baseEmbed = {
        author: {
          name: `Powered by Gemini AI 2.0 Flash`,
          iconURL:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s",
        },
        footer: {
          text: `AI-generated content may be inaccurate`,
        },
        timestamp: Date.now(),
      };

      // Send first part
      const firstEmbed = new EmbedBuilder(baseEmbed)
        .setTitle(`Answer for ${message.author.username}`)
        .setDescription(filteredParts[0]);

      if (isInThread) {
        lastMessage = await message.channel.send({ embeds: [firstEmbed] });
      } else {
        lastMessage = await message.reply({
          embeds: [firstEmbed],
          allowedMentions: { repliedUser: false },
        });
      }

      // Send subsequent parts
      for (let i = 1; i < filteredParts.length; i++) {
        const continueEmbed = new EmbedBuilder(baseEmbed)
          .setTitle(`Continued Answer [Part ${i + 1}]`)
          .setDescription(filteredParts[i]);

        lastMessage = await lastMessage.reply({
          embeds: [continueEmbed],
          allowedMentions: { repliedUser: false },
        });

        // Avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Logging
      const logFields = [
        { name: "User", value: `<@${message.author.id}>`, inline: true },
        { name: "Parts Sent", value: `${filteredParts.length}`, inline: true },
      ];

      if (isInThread) {
        logFields.push(
          {
            name: "Channel",
            value: `#${message.channel.parent.name}`,
            inline: true,
          },
          { name: "Thread", value: `#${message.channel.name}`, inline: true }
        );
      } else {
        logFields.push({
          name: "Channel",
          value: `#${message.channel.name}`,
          inline: true,
        });
      }

      await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
        author: {
          name: message.author.tag,
          icon_url: message.author.displayAvatarURL(),
        },
        title: "AI Request Processed",
        description: `**Question:** ${userQuestion}`,
        fields: logFields,
      });
    } catch (error) {
      console.error("AI Processing Error:", error);

      const errorEmbed = new EmbedBuilder()
        .setTitle("⚠️ Processing Error")
        .setDescription("Failed to generate AI response")
        .addFields(
          { name: "Error", value: error.message.substring(0, 1024) },
          { name: "User", value: message.author.toString() }
        )
        .setColor(0xff0000);

      await message.reply({
        embeds: [errorEmbed],
        allowedMentions: { repliedUser: false },
      });

      await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
        author: {
          name: message.client.user.tag,
          icon_url: message.client.user.displayAvatarURL(),
        },
        title: "AI Processing Failure",
        description: `**Question:** ${userQuestion}`,
        fields: [
          { name: "Error", value: error.message },
          { name: "Stack", value: error.stack.substring(0, 1024) },
        ],
      });
    }
  },

  toggleAiStatus: (status) => {
    aiStatus = status;
  },

  getAiStatus: () => aiStatus,
};
