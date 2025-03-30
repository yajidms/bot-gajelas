const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");

// ===================== CONFIGURATION =====================
const fileSizeLimit = 8 * 1024 * 1024; // 8MB

// ===================== MAIN FUNCTIONS =====================
const validateUrl = (url) => /^https?:\/\/\S+/.test(url);

const getFileSize = async (url) => {
  try {
    const response = await axios.head(url, { maxRedirects: 5 });
    return parseInt(response.headers["content-length"], 10);
  } catch (error) {
    console.error("Failed to get file size:", error);
    return Infinity;
  }
};

// ===================== HANDLERS =====================
module.exports = {
  handleTwitterDownload: async (message) => {
    const prefix = "f.x";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const url = args[0];
    const messageContent = args.slice(1).join(" ");

    try {
      await message
        .delete()
        .catch((e) => console.error("Failed to delete message:", e));

      if (!validateUrl(url)) {
        return message.channel
          .send("⚠️ Invalid URL!")
          .then((msg) => setTimeout(() => msg.delete().catch((e) => {}), 3000));
      }

      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/twitter?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const mediaData = response.data.media[0];
      if (!mediaData?.url) throw new Error("Media URL not found");

      const fileSize = await getFileSize(mediaData.url);
      const modifiedUrl = mediaData.url.replace("dl=1", "dl=0");

      const attachment = new AttachmentBuilder(mediaData.url, {
        name: "twitter.mp4",
      });

      const msgContent = `${messageContent || ""}\n${message.author}${
        fileSize > fileSizeLimit ? `\n[᲼](${modifiedUrl})` : ""
      }`;

      return message.channel.send({
        content: msgContent,
        files: fileSize > fileSizeLimit ? [] : [attachment],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error("Twitter Downloader Error:", error);
      message.channel
        .send("❌ Failed to download Twitter video!")
        .catch((e) => console.error("Failed to send error:", e));
    }
  },

  handleIgDownload: async (message) => {
    const prefix = "f.ig";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const url = args[0];

    try {
      await message.delete().catch(console.error);

      if (!validateUrl(url)) {
        return message.channel
          .send("⚠️ Invalid URL!")
          .then((msg) => setTimeout(() => msg.delete(), 3000));
      }

      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/igdl?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const mediaData = response.data.data[0];
      const fileSize = await getFileSize(mediaData.url);

      if (fileSize > fileSizeLimit) {
        const modifiedUrl = mediaData.url.replace("dl=1", "dl=0");
        return message.channel.send({
          content: `${message.author} [᲼](${modifiedUrl})`,
          allowedMentions: { parse: [] },
        });
      }

      const attachment = new AttachmentBuilder(mediaData.url, {
        name: "instagram.mp4",
      });
      message.channel.send({
        content: `${message.author}`,
        files: [attachment],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error("Instagram Downloader Error:", error);
      message.channel.send("❌ Failed to download Instagram video!");
    }
  },

  handleFbDownload: async (message) => {
    const prefix = "f.fb";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const url = args[0];

    try {
      await message.delete().catch(console.error);

      if (!validateUrl(url)) {
        return message.channel
          .send("⚠️ Invalid URL!")
          .then((msg) => setTimeout(() => msg.delete(), 3000));
      }

      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/fbdl?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const mediaData = response.data.data[0];
      const fileSize = await getFileSize(mediaData.url);

      if (fileSize > fileSizeLimit) {
        const modifiedUrl = mediaData.url.replace("dl=1", "dl=0");
        return message.channel.send({
          content: `${message.author} [᲼](${modifiedUrl})`,
          allowedMentions: { parse: [] },
        });
      }

      const attachment = new AttachmentBuilder(mediaData.url, {
        name: "facebook.mp4",
      });
      message.channel.send({
        content: `${message.author}`,
        files: [attachment],
        allowedMentions: { parse: [] },
      });
    } catch (error) {
      console.error("Facebook Downloader Error:", error);
      message.channel.send("❌ Failed to download Facebook video!");
    }
  },
};
