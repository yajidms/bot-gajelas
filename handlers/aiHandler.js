const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { sendLog } = require("./logHandler");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const pptx2json = require("pptx2json");
const Tesseract = require("tesseract.js");

let aiStatus = true;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });
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
    ".nim", ".ps1", ".psm1", ".psd1", ".rkt", ".vb", ".vbs", ".v", ".sv", ".svelte"
  ];
  const imageExtensions = [
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"
  ];

  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(tempPath, response.data);

  let text = "";
  try {
    if (codeExtensions.some(ext => name.endsWith(ext))) {
      text = fs.readFileSync(tempPath, "utf8");
    } else if (imageExtensions.some(ext => name.endsWith(ext))) {
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
    } else if (name.endsWith(".docx")) {
      const data = fs.readFileSync(tempPath);
      const result = await mammoth.extractRawText({ buffer: data });
      text = result.value;
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const workbook = XLSX.readFile(tempPath);
      text = workbook.SheetNames.map(sheetName => {
        const sheet = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        return `Sheet: ${sheetName}\n${sheet}`;
      }).join("\n\n");
    } else if (name.endsWith(".pptx")) {
      const slides = await pptx2json(tempPath);
      text = slides
        .map((slide, idx) =>
          `Slide ${idx + 1}:\n${slide.texts ? slide.texts.join("\n") : ""}`
        )
        .join("\n\n");
    } else if (name.endsWith(".ppt")) {
      text = "[.ppt format not supported, use .pptx]";
    } else {
      text = "[Unsupported file type]";
    }
  } catch (e) {
    text = "[Failed to read attachment]";
  }
  fs.unlinkSync(tempPath);
  return text;
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
            "_You can also attach a .txt, .pdf, or .docx file to include its content in your question!_"
        )
        .setColor(0x5865f2);
      return message.reply({
        embeds: [tutorialEmbed],
        allowedMentions: { repliedUser: false },
      });
    }

    // Cek jika ada attachment
    let fileContent = "";
    if (message.attachments && message.attachments.size > 0) {
      const attachment = message.attachments.first();
      try {
        fileContent = await readAttachment(attachment);
      } catch (e) {
        fileContent = "[Failed to read attachment]";
      }
    }

    // Gabungkan fileContent ke prompt jika ada
    function combinePrompt(prompt) {
      if (fileContent) {
        return `${prompt}\n\n[File Content Start]\n${fileContent}\n[File Content End]`;
      }
      return prompt;
    }

    if (message.content.startsWith(geminiPrefix)) {
      await handleGeminiResponse(message, geminiPrefix, combinePrompt);
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

async function handleGeminiResponse(message, prefix, combinePrompt = (x) => x) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion && (!message.attachments || message.attachments.size === 0)) {
    return message.reply({
      content: "Please write down the issue you want to ask after `f.gemini`.",
      allowedMentions: { repliedUser: false },
    });
  }
  const prompt = combinePrompt(userQuestion);

  try {
    const response = await model.generateContent(prompt);
    let answer = response.response.text();
    const partsSent = await sendResponse(
      message,
      answer,
      "Gemini AI 2.5 Pro Experimental",
      "https://i.imgur.com/7FNd7DF.png"
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

async function handleLlamaResponse(message, prefix, combinePrompt = (x) => x) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion && (!message.attachments || message.attachments.size === 0)) {
    return message.reply({
      content: "Please write down the issue you want to ask after `f.llama`.",
      allowedMentions: { repliedUser: false },
    });
  }
  const prompt = combinePrompt(userQuestion);

  try {
    const payload = {
      model: llamaModel,
      messages: [
        { role: "user", content: [{ type: "text", text: prompt }] },
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

async function handleDeepSeekResponse(message, prefix, combinePrompt = (x) => x) {
  const userQuestion = message.content.slice(prefix.length).trim();
  if (!userQuestion && (!message.attachments || message.attachments.size === 0)) {
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

    // Logging success
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