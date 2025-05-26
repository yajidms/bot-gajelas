const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");

// ===================== KONFIGURASI =====================
const FILE_SIZE_LIMIT = 100 * 1024 * 1024;
const PLATFORM_CONFIG = {
  ig: {
    endpoint: "igdl",
    fileName: "instagram.mp4",
    dataPath: "data[0]",
    prefix: "f.ig",
  },
  fb: {
    endpoint: "fbdl",
    fileName: "facebook.mp4",
    dataPath: "data[0]",
    prefix: "f.fb",
  },
  tt: {
    endpoint: "ttdl",
    fileName: "tiktok.mp4",
    dataPath: "data[0]",
    prefix: "f.tt",
  },
};

// ===================== UTILITIES =====================
const validateUrl = (url) => /^https?:\/\/\S+/.test(url);

const getFileSize = async (url) => {
  try {
    const response = await axios.head(url, { maxRedirects: 5 });
    return parseInt(response.headers["content-length"], 10) || Infinity;
  } catch {
    return Infinity;
  }
};

const extractMediaData = (response, dataPath) => {
  const [mainKey, arrayIndex] = dataPath.split(/[\[\]]/g).filter(Boolean);
  return response.data[mainKey][arrayIndex];
};

// ===================== USAGE TUTORIAL =====================
const USAGE_TUTORIAL = {
  ig: "Masukkan URL Reel Instagram yang valid!\nContoh: `f.ig https://instagram.com/...`",
  fb: "Masukkan URL Video Facebook yang valid!\nContoh: `f.fb https://facebook.com/...`",
  tt: "Masukkan URL Video TikTok yang valid!\nContoh: `f.tt https://tiktok.com/...`",
};

// ===================== CORE HANDLER =====================
const handleMediaDownload = async (message, platform) => {
  const config = PLATFORM_CONFIG[platform];
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const [url, ...messageParts] = args;
  const messageContent = messageParts.join(" ");

  // Tampilkan tutor hanya untuk prefix yang dipakai
  if (!validateUrl(url)) {
    return message.reply(USAGE_TUTORIAL[platform]);
  }

  try {
    await message.delete().catch(() => {});

    const apiUrl = `https://api.ryzendesu.vip/api/downloader/${
      config.endpoint
    }?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      },
    });

    const mediaData = extractMediaData(response, config.dataPath);
    if (!mediaData?.url) throw new Error("Media tidak ditemukan");

    const fileSize = await getFileSize(mediaData.url);
    const modifiedUrl = mediaData.url.replace("dl=1", "dl=0");

    const userMention = `<@${message.author.id}>`;
    const content = [
      messageContent,
      `${userMention}`,
      fileSize > FILE_SIZE_LIMIT ? `[᲼](${modifiedUrl})` : "",
    ]
      .filter(Boolean)
      .join("\n");

    if (fileSize <= FILE_SIZE_LIMIT) {
      const attachment = new AttachmentBuilder(mediaData.url, {
        name: config.fileName,
      });
      await message.channel.send({
        content: content,
        files: [attachment],
        allowedMentions: { parse: [] },
      });
    } else {
      await message.channel.send({
        content: content,
        allowedMentions: { parse: [] },
      });
    }
  } catch (error) {
    console.error(`[${platform.toUpperCase()}_ERROR]`, error);
    const errorMessage = await message.channel.send(
      `❌ Gagal mengunduh ${platform.toUpperCase()} video!`
    );
    setTimeout(() => errorMessage.delete().catch(() => {}), 5000);
  }
};

// ===================== EXPORTS =====================
module.exports = {
  handleIg: (message) => handleMediaDownload(message, "ig"),
  handleFb: (message) => handleMediaDownload(message, "fb"),
  handleTt: (message) => handleMediaDownload(message, "tt"),
};
