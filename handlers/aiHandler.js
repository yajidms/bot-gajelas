const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

let aiStatus = true;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const llamaApiKey = process.env.LLAMA_API_KEY;
const llamaModel = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";

module.exports = {
  handleAiChat: async (message) => {
    const geminiPrefix = "f.gemini";
    const llamaPrefix = "f.llama4";

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

    if (message.content.startsWith(geminiPrefix)) {
      await handleGeminiResponse(message, geminiPrefix);
    } else if (message.content.startsWith(llamaPrefix)) {
      await handleLlamaResponse(message, llamaPrefix);
    }
  },

  toggleAiStatus: (status) => {
    aiStatus = status;
  },

  getAiStatus: () => aiStatus,
};

async function handleGeminiResponse(message, prefix) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion) {
    return message.reply({
      content: "Please write down the issue you want to ask after `f.gemini`.",
      allowedMentions: { repliedUser: false },
    });
  }

  try {
    const response = await model.generateContent(userQuestion);
    let answer = response.response.text();
    await sendResponse(
      message,
      answer,
      "Gemini AI 2.0 Flash",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s"
    );
  } catch (error) {
    await handleError(message, "Gemini", error);
  }
}

async function handleLlamaResponse(message, prefix) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion) {
    return message.reply({
      content: "Please write down the issue you want to ask after `f.llama4`.",
      allowedMentions: { repliedUser: false },
    });
  }

  try {
    const payload = {
      model: llamaModel,
      messages: [
        { role: "user", content: [{ type: "text", text: userQuestion }] },
      ],
    };

    const response = await axios.post(
      "https://api.together.ai/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${llamaApiKey}`,
        },
      }
    );

    let answer = response.data.choices[0].message.content;
    await sendResponse(
      message,
      answer,
      "Llama 4 AI",
      "https://i.imgur.com/i0vcc7G.jpeg"
    );
  } catch (error) {
    await handleError(message, "Llama 4", error);
  }
}

async function sendResponse(message, answer, modelName, iconUrl) {
  if (!answer) throw new Error("AI returned empty response");

  const answerParts = [];
  while (answer.length > 0) {
    answerParts.push(answer.substring(0, 4096));
    answer = answer.substring(4096);
  }

  const filteredParts = answerParts.filter((part) => part.trim().length > 0);
  if (filteredParts.length === 0) throw new Error("No valid content generated");

  let lastMessage;
  const baseEmbed = {
    author: {
      name: `Powered by ${modelName}`,
      iconURL: iconUrl,
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
}

async function handleError(message, modelName, error) {
  console.error(`${modelName} Processing Error:`, error);

  const errorEmbed = new EmbedBuilder()
    .setTitle("⚠️ Processing Error")
    .setDescription(`Failed to generate ${modelName} response`)
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
