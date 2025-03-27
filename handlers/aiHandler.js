const { GoogleGenerativeAI } = require("@google/generative-ai"); 
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

let aiStatus = true;
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
        content: "AI feature is currently disabled. Contact admin to enable this feature.",
        allowedMentions: { repliedUser: false },
      });
    }

    try {
      const response = await model.generateContent(userQuestion);
      let answer = response.response.text();

      if (!answer) throw new Error("AI returned empty response");

      const answerParts = [];
      while (answer.length > 0) {
        answerParts.push(answer.substring(0, 4096));
        answer = answer.substring(4096);
      }

      const filteredParts = answerParts.filter((part) => part.trim().length > 0);
      if (filteredParts.length === 0)
        throw new Error("No valid content generated");

      let lastMessage;
      const baseEmbed = {
        author: {
          name: `Powered by Gemini AI 2.0 Flash`,
          iconURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s",
        },
        footer: {
          text: `AI-generated content may be inaccurate`,
        },
        timestamp: Date.now(),
      };

      const firstEmbed = new EmbedBuilder(baseEmbed)
        .setTitle(`Answer for ${message.author.username}`)
        .setDescription(filteredParts[0]);

      lastMessage = await message.reply({
        embeds: [firstEmbed],
        allowedMentions: { repliedUser: false },
      });

      for (let i = 1; i < filteredParts.length; i++) {
        const continueEmbed = new EmbedBuilder(baseEmbed)
          .setTitle(`Continued Answer [Part ${i + 1}]`)
          .setDescription(filteredParts[i]);

        lastMessage = await lastMessage.reply({
          embeds: [continueEmbed],
          allowedMentions: { repliedUser: false },
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
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
    }
  },

  toggleAiStatus: (status) => {
    aiStatus = status;
  },

  getAiStatus: () => aiStatus,
};
