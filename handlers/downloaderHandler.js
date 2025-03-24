const axios = require("axios");
const { sendLog } = require("./logHandler");

let igDownloaderStatus = true; // Downloader feature status, default active
let fbDownloaderStatus = true; // Facebook downloader feature status, default active
let twitterDownloaderStatus = true; // Twitter downloader feature status, default active
let tiktokDownloaderStatus = true; // TikTok downloader feature status, default active

module.exports = {
  handleIgDownload: async (message) => {
    const prefix = "f.ig";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const url = args[0];

    if (!url)
      return message.reply({
        content: `⚠️ Please enter a video URL.`,
        allowedMentions: { repliedUser: false },
      });
    if (!/^https?:\/\/\S+/.test(url))
      return message.reply({
        content: `⚠️ Invalid URL.`,
        allowedMentions: { repliedUser: false },
      });

    try {
      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/igdl?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const data = response.data.data[0];
      if (!data || !data.url)
        return message.channel.send(
          "❌ Failed to retrieve video from Instagram."
        );

      message.reply({
        content: "",
        files: [{ attachment: data.url, name: "video.mp4" }],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error(error);
      message.channel.send("❌ An error occurred while retrieving the video.");
    }
  },

  handleFbDownload: async (message) => {
    const prefix = "f.fb";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const url = args[0];

    if (!url)
      return message.reply({
        content: `⚠️ Please enter a video URL.`,
        allowedMentions: { repliedUser: false },
      });
    if (!/^https?:\/\/\S+/.test(url))
      return message.reply({
        content: `⚠️ Invalid URL.`,
        allowedMentions: { repliedUser: false },
      });

    try {
      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/fbdl?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const data = response.data.data[0];
      if (!data || !data.url)
        return message.channel.send(
          "❌ Failed to retrieve video from Facebook."
        );

      message.reply({
        content: "",
        files: [{ attachment: data.url, name: "video.mp4" }],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error(error);
      message.channel.send("❌ An error occurred while retrieving the video.");
    }
  },

  handleTwitterDownload: async (message) => {
    const prefix = "f.twitter";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const url = args[0];

    if (!url)
      return message.reply({
        content: `⚠️ Please enter a video URL.`,
        allowedMentions: { repliedUser: false },
      });
    if (!/^https?:\/\/\S+/.test(url))
      return message.reply({
        content: `⚠️ Invalid URL.`,
        allowedMentions: { repliedUser: false },
      });

    try {
      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/v2/twitter?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const data = response.data.data[0];
      if (!data || !data.url)
        return message.channel.send(
          "❌ Failed to retrieve video from Twitter."
        );

      message.reply({
        content: "",
        files: [{ attachment: data.url, name: "video.mp4" }],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error(error);
      message.channel.send("❌ An error occurred while retrieving the video.");
    }
  },

  handleTiktokDownload: async (message) => {
    const prefix = "f.tiktok";
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const url = args[0];

    if (!url)
      return message.reply({
        content: `⚠️ Please enter a video URL.`,
        allowedMentions: { repliedUser: false },
      });
    if (!/^https?:\/\/\S+/.test(url))
      return message.reply({
        content: `⚠️ Invalid URL.`,
        allowedMentions: { repliedUser: false },
      });

    try {
      const response = await axios.get(
        `https://api.ryzendesu.vip/api/downloader/ttdl?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const data = response.data.data[0];
      if (!data || !data.url)
        return message.channel.send("❌ Failed to retrieve video from TikTok.");

      message.reply({
        content: "",
        files: [{ attachment: data.url, name: "video.mp4" }],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error(error);
      message.channel.send("❌ An error occurred while retrieving the video.");
    }
  },
};
