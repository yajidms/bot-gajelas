const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { sendLog } = require("./logHandler");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const officeParser = require("officeparser");
const Tesseract = require("tesseract.js");

let aiStatus = true;
const geminiKeys = [process.env.GEMINI_API_KEY];

let currentGeminiKeyIndex = 0;

function getActiveGeminiKey() {
  return geminiKeys[currentGeminiKeyIndex];
}

function switchGeminiKey() {
  currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % geminiKeys.length;
}

function getGeminiModel(modelName) {
  const genAI = new GoogleGenerativeAI(getActiveGeminiKey());
  return genAI.getGenerativeModel({ model: modelName });
}
// === End Gemini API Key Switcher ===

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

async function readAttachment(attachment) {
  const url = attachment.url;
  const name = attachment.name.toLowerCase();
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const tempPath = path.join(tempDir, `${Date.now()}_${name}`);

  const codeExtensions = [
    ".txt", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".c", ".cpp", ".cs",
    ".rb", ".go", ".php", ".swift", ".kt", ".kts", ".rs", ".scala", ".sh",
    ".bat", ".pl", ".lua", ".r", ".m", ".vb", ".dart", ".html", ".css", ".scss",
    ".less", ".json", ".xml", ".yml", ".yaml", ".md", ".ini", ".cfg", ".toml",
    ".sql", ".asm", ".s", ".h", ".hpp", ".vue", ".coffee", ".erl", ".ex", ".exs",
    ".fs", ".fsx", ".groovy", ".jl", ".lisp", ".clj", ".cljs", ".ml", ".mli",
    ".nim", ".ps1", ".psm1", ".psd1", ".rkt", ".vb", ".vbs", ".v", ".sv", ".svelte", ".jar"
  ];
  const imageExtensions = [
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"
  ];

  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(tempPath, response.data);

  let text = "";
  try {
    if (codeExtensions.some((ext) => name.endsWith(ext))) {
      text = fs.readFileSync(tempPath, "utf8");
    } else if (imageExtensions.some((ext) => name.endsWith(ext))) {
      // Metadata
      const stats = fs.statSync(tempPath);
      text = `[Image file: ${name}, size: ${stats.size} bytes]\n`;

      if (!name.endsWith(".svg") && !name.endsWith(".gif")) {
        text += "\n[OCR Result Start]\n";
        const ocr = await Tesseract.recognize(tempPath, "eng");
        text += ocr.data.text.trim() || "(No text detected)";
        text += "\n[OCR Result End]";
      }
    } else if (name.endsWith(".pdf")) {
      const data = fs.readFileSync(tempPath);
      const pdf = await pdfParse(data);
      text = pdf.text;
    } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
      // Use officeparser for Word documents
      try {
        const data = await officeParser.parseOfficeAsync(tempPath);
        text = data || "[Word document processed but no text content found]";
      } catch (docError) {
        console.error("Word document processing error:", docError);
        text = `[Failed to process Word document: ${docError.message}]`;
      }
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      // Use officeparser for Excel documents
      try {
        const data = await officeParser.parseOfficeAsync(tempPath);
        text = data || "[Excel document processed but no text content found]";
      } catch (excelError) {
        console.error("Excel document processing error:", excelError);
        text = `[Failed to process Excel document: ${excelError.message}]`;
      }
    } else if (name.endsWith(".pptx") || name.endsWith(".ppt")) {
      // Use officeparser for PowerPoint documents
      try {
        const data = await officeParser.parseOfficeAsync(tempPath);
        text = data || "[PowerPoint document processed but no text content found]";
      } catch (pptError) {
        console.error("PowerPoint document processing error:", pptError);
        text = `[Failed to process PowerPoint document: ${pptError.message}]`;
      }
    } else {
      text = "[Unsupported file type]";
    }
  } catch (e) {
    console.error("General file processing error:", e);
    text = `[Failed to read attachment: ${e.message}]`;
  }
  
  // Clean up temp file
  try {
    fs.unlinkSync(tempPath);
  } catch (cleanupError) {
    console.warn("Failed to cleanup temp file:", cleanupError);
  }
  
  return text;
}

module.exports = {
  handleAiChat: async (message) => {
    const geminiProPrefix = "f.geminipro";
    const geminiFlashPrefix = "f.geminiflash";
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

    // send tutorial if user asks for help
    if (message.content.trim() === "f.ai") {
      const tutorialEmbed = new EmbedBuilder()
        .setTitle("How to Use AI Chat")
        .setDescription(
          "**Use the following command to ask the AI:**\n\n" +
            "**Gemini Pro:**\n" +
            "`f.geminipro [your question]`\n" +
            "**Gemini Flash:**\n" +
            "`f.geminiflash [your question]`\n" +
            "**Llama AI:**\n" +
            "`f.llama [your question]`\n" +
            "**DeepSeek R1:**\n" +
            "`f.deepseek-r1 [your question]`\n" +
            "_You can also attach files (documents and images) to include their content in your question!_"
        )
        .setColor(0x5865f2);
      return message.reply({
        embeds: [tutorialEmbed],
        allowedMentions: { repliedUser: false },
      });
    }

    let fileContent = "";
    if (message.attachments && message.attachments.size > 0) {
      const fileContents = [];
      for (const attachment of message.attachments.values()) {
        try {
          const content = await readAttachment(attachment);
          fileContents.push(
            `--- File: ${attachment.name} ---\n${content}\n--- End of ${attachment.name} ---`
          );
        } catch (e) {
          fileContents.push(`--- File: ${attachment.name} ---\n[Failed to read attachment: ${e.message}]\n--- End of ${attachment.name} ---`);
        }
      }
      fileContent = fileContents.join("\n\n");
    }

    // Combine prompt with file content if available
    function combinePrompt(prompt) {
      if (fileContent) {
        return `${prompt}\n\n[File Content Start]\n${fileContent}\n[File Content End]`;
      }
      return prompt;
    }

    if (message.content.startsWith(geminiProPrefix)) {
      await handleGeminiResponse(
        message,
        geminiProPrefix,
        combinePrompt,
        null,
        "Gemini 2.5 Pro",
        "https://i.imgur.com/7FNd7DF.png"
      );
    } else if (message.content.startsWith(geminiFlashPrefix)) {
      await handleGeminiResponse(
        message,
        geminiFlashPrefix,
        combinePrompt,
        null,
        "Gemini 2.5 Flash Preview",
        "https://i.imgur.com/7FNd7DF.png"
      );
    } else if (message.content.startsWith(llamaPrefix)) {
      await handleLlamaResponse(message, llamaPrefix, combinePrompt);
    } else if (message.content.startsWith(deepthinkPrefix)) {
      await handleDeepSeekResponse(message, deepthinkPrefix, combinePrompt);
    }
  },

  toggleAiStatus: (status) => {
    aiStatus = status;
  },

  getAiStatus: () => aiStatus,
};

async function handleGeminiResponse(
  message,
  prefix,
  combinePrompt = (x) => x,
  _unused,
  modelName,
  iconUrl
) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (
    !userQuestion &&
    (!message.attachments || message.attachments.size === 0)
  ) {
    return message.reply({
      content: `Please write down the issue you want to ask after \`${prefix}\`.`,
      allowedMentions: { repliedUser: false },
    });
  }
  const prompt = combinePrompt(userQuestion);

  // send thinking message
  const thinkingEmbed = new EmbedBuilder()
    .setDescription("thinking...")
    .setColor(0xffa500)
    .setAuthor({
      name: `Powered by ${modelName}`,
      iconURL: iconUrl,
    })
    .setTimestamp();

  const thinkingMessage = await message.reply({
    embeds: [thinkingEmbed],
    allowedMentions: { repliedUser: false },
  });

  let lastError;
  for (let i = 0; i < geminiKeys.length; i++) {
    try {
      const usedModel = getGeminiModel(
        modelName.includes("Flash")
          ? "gemini-2.5-flash"
          : "gemini-2.5-pro"
      );
      const response = await usedModel.generateContent(prompt);
      let answer = response.response.text();
      
      const partsSent = await sendResponseWithEdit(thinkingMessage, answer, modelName, iconUrl, message.author.username);
      

      await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
        userId: message.author.id,
        messageId: message.id,
        author: {
          name: message.author.tag,
          icon_url: message.author.displayAvatarURL(),
        },
        title: `${modelName} Request Processed`,
        description: `**Question:** ${userQuestion}`,
        fields: [
          { name: "User", value: `<@${message.author.id}>`, inline: true },
          { name: "Parts Sent", value: `${partsSent}`, inline: true },
        ],
      });
      return;
    } catch (error) {
      lastError = error;
      // Deteksi error limit/quota
      if (
        error.message &&
        (error.message.toLowerCase().includes("quota") ||
          error.message.toLowerCase().includes("limit") ||
          error.message.toLowerCase().includes("exceeded"))
      ) {
        switchGeminiKey();
        continue;
      } else {
        break;
      }
    }
  }
  
  // If all API keys fail, edit the thinking message to error
  try {
    await thinkingMessage.edit({
      embeds: [new EmbedBuilder()
        .setTitle("Processing Error")
        .setDescription(`Failed to generate ${modelName} response`)
        .addFields(
          { name: "Error", value: lastError.message.substring(0, 1024) },
          { name: "User", value: message.author.toString() }
        )
        .setColor(0xff0000)],
    });
  } catch (editError) {
    await handleError(message, modelName, lastError, userQuestion);
  }
}

async function handleLlamaResponse(message, prefix, combinePrompt = (x) => x) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (
    !userQuestion &&
    (!message.attachments || message.attachments.size === 0)
  ) {
    return message.reply({
      content: "Please write down the issue you want to ask after `f.llama`.",
      allowedMentions: { repliedUser: false },
    });
  }
  const prompt = combinePrompt(userQuestion);

  try {
    const payload = {
      model: llamaModel,
      messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
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

    await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
      userId: message.author.id,
      messageId: message.id,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL(),
      },
      title: "Llama AI Request Processed",
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

async function handleDeepSeekResponse(
  message,
  prefix,
  combinePrompt = (x) => x
) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (
    !userQuestion &&
    (!message.attachments || message.attachments.size === 0)
  ) {
    return message.reply({
      content:
        "Please write down the issue you want to ask after `f.deepseek-r1`.",
      allowedMentions: { repliedUser: false },
    });
  }
  const prompt = combinePrompt(userQuestion);

  try {
    const payload = {
      model: deepseekModel,
      messages: [{ role: "user", content: prompt }],
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
      "https://i.imgur.com/yIilZ11.png"
    );

    await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
      userId: message.author.id,
      messageId: message.id,
      author: {
        name: message.author.tag,
        icon_url: message.author.displayAvatarURL(),
      },
      title: "DeepSeek Request Processed",
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

// New function to edit thinking messages into responses
async function sendResponseWithEdit(thinkingMessage, answer, modelName, iconUrl, username) {
  if (!answer) throw new Error("AI returned empty response");

  const answerParts = [];
  while (answer.length > 0) {
    answerParts.push(answer.substring(0, 4096));
    answer = answer.substring(4096);
  }

  const filteredParts = answerParts.filter((part) => part.trim().length > 0);
  if (filteredParts.length === 0) throw new Error("No valid content generated");

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

  // Edit the thinking message with the first response
  const firstEmbed = new EmbedBuilder(baseEmbed)
    .setTitle(`Answer for ${username}`)
    .setDescription(filteredParts[0]);

  await thinkingMessage.edit({
    embeds: [firstEmbed],
  });

  let lastMessage = thinkingMessage;

  // send continued parts as replies
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