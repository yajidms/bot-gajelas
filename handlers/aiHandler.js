const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { sendLog } = require("./logHandler");

let aiStatus = true;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const togetherApiKey = process.env.TOGETHER_API_KEY;
const llamaModel = "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8";
const deepseekModel = "deepseek-ai/DeepSeek-R1";

// Fungsi format <think> jadi -# blockquote
function formatThinkBlockquote(text) {
  return text.replace(/<think>([\s\S]*?)<\/think>/g, (match, content) => {
    return content
      .split("\n")
      .map((line) => (line.trim() ? `-# ${line}` : ""))
      .join("\n");
  });
}

module.exports = {
  handleAiChat: async (message) => {
    const geminiPrefix = "f.gemini";
    const llamaPrefix = "f.llama";
    const deepthinkPrefix = "f.deepseek-r1";

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

    // Kirim tutorial jika user mengetik f.ai tanpa pertanyaan
    if (message.content.trim() === "f.ai") {
      const tutorialEmbed = new EmbedBuilder()
        .setTitle("How to Use AI Chat")
        .setDescription(
          "**Use the following command to ask the AI:**\n\n" +
            "**Gemini AI:**\n" +
            "`f.gemini [your question]`\n" +
            "**Llama AI:**\n" +
            "`f.llama [your question]`\n" +
            "**DeepSeek R1:**\n" +
            "`f.deepseek-r1 [your question]`\n" +
            "_Make sure the prefix is followed by a space and then your question!_"
        )
        .setColor(0x5865f2);
      return message.reply({
        embeds: [tutorialEmbed],
        allowedMentions: { repliedUser: false },
      });
    }

    if (message.content.startsWith(geminiPrefix)) {
      await handleGeminiResponse(message, geminiPrefix);
    } else if (message.content.startsWith(llamaPrefix)) {
      await handleLlamaResponse(message, llamaPrefix);
    } else if (message.content.startsWith(deepthinkPrefix)) {
      await handleDeepSeekResponse(message, deepthinkPrefix);
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
    const partsSent = await sendResponse(
      message,
      answer,
      "Gemini AI 2.0 Flash",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s"
    );

    // Logging success
    await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
      userId: message.author.id,
      messageId: message.id,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL(),
      },
      title: "Gemini AI Request Processed",
      description: `**Question:** ${userQuestion}`,
      fields: [
        { name: "User", value: `<@${message.author.id}>`, inline: true },
        { name: "Parts Sent", value: `${partsSent}`, inline: true },
      ],
    });
  } catch (error) {
    await handleError(message, "Gemini", error, userQuestion);
  }
}

async function handleLlamaResponse(message, prefix) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion) {
    return message.reply({
      content: "Please write down the issue you want to ask after `f.llama`.",
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
          Authorization: `Bearer ${togetherApiKey}`,
        },
      }
    );

    let answer = response.data.choices[0].message.content;
    const partsSent = await sendResponse(
      message,
      answer,
      "Llama 4 Maverick AI",
      "https://i.imgur.com/i0vcc7G.jpeg"
    );

    // Logging success
    await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
      userId: message.author.id,
      messageId: message.id,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL(),
      },
      title: "Llama 4 Maverick AI Request Processed",
      description: `**Question:** ${userQuestion}`,
      fields: [
        { name: "User", value: `<@${message.author.id}>`, inline: true },
        { name: "Parts Sent", value: `${partsSent}`, inline: true },
      ],
    });
  } catch (error) {
    await handleError(message, "Llama 4", error, userQuestion);
  }
}

async function handleDeepSeekResponse(message, prefix) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion) {
    return message.reply({
      content:
        "Please write down the issue you want to ask after `f.deepseek-r1`.",
      allowedMentions: { repliedUser: false },
    });
  }

  try {
    const payload = {
      model: deepseekModel,
      messages: [{ role: "user", content: userQuestion }],
      stream: false,
    };

    const response = await axios.post(
      "https://api.together.ai/v1/chat/completions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${togetherApiKey}`,
        },
      }
    );

    let answer = response.data.choices[0].message.content;
    answer = formatThinkBlockquote(answer);

    const partsSent = await sendResponse(
      message,
      answer,
      "DeepSeek R1",
      "blob:https://imgur.com/910354e1-c151-408a-b4d8-4f8b5530a2ec"
    );

    // Logging success
    await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
      userId: message.author.id,
      messageId: message.id,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL(),
      },
      title: "DeepSeek R1 Request Processed",
      description: `**Question:** ${userQuestion}`,
      fields: [
        { name: "User", value: `<@${message.author.id}>`, inline: true },
        { name: "Parts Sent", value: `${partsSent}`, inline: true },
      ],
    });
  } catch (error) {
    await handleError(message, "DeepSeek R1", error, userQuestion);
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

  return filteredParts.length;
}

async function handleError(message, modelName, error, userQuestion = "") {
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

  // Logging error
  await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
    userId: message.author.id,
    messageId: message.id,
    author: {
      name: message.client.user.tag,
      icon_url: message.client.user.displayAvatarURL(),
    },
    title: `${modelName} AI Processing Failure`,
    description: `**Question:** ${userQuestion}`,
    fields: [
      { name: "Error", value: error.message },
      {
        name: "Stack",
        value: error.stack ? error.stack.substring(0, 1024) : "-",
      },
    ],
  });
}