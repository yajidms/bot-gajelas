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

      // Cek ukuran file
      const fileSizeLimit = 8 * 1024 * 1024; // 8MB
      let fileSize;
      try {
        fileSize = await getFileSize(data.url);
      } catch (error) {
        console.error("Error getting file size:", error);
        fileSize = Infinity; // Default ke ukuran besar jika gagal
      }

      if (fileSize > fileSizeLimit) {
        // Jika file terlalu besar, kirim link
        const modifiedUrl = data.url.replace("dl=1", "dl=0");
        return message.reply({
          content: `[File too large! Download link:](${modifiedUrl})`,
          allowedMentions: { repliedUser: false },
        });
      }

      // Jika ukuran aman, kirim sebagai attachment
      message.reply({
        content: "",
        files: [{ attachment: data.url, name: "instagram.mp4" }],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error(error);
      // Coba kirim link jika error kemungkinan karena ukuran file
      if (data?.url) {
        const modifiedUrl = data.url.replace("dl=1", "dl=0");
        message.channel.send(
          `❌ Video too large, try downloading: ${modifiedUrl}`
        );
      } else {
        message.channel.send(
          "❌ An error occurred while retrieving the video."
        );
      }
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
    const prefix = "f.x";
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
        `https://api.ryzendesu.vip/api/downloader/twitter?url=${url}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        }
      );

      const data = response.data.media[0];
      if (!data || !data.url)
        return message.channel.send(
          "❌ Failed to retrieve video from Instagram."
        );

      // Cek ukuran file
      const fileSizeLimit = 8 * 1024 * 1024; // 8MB
      let fileSize;
      try {
        fileSize = await getFileSize(data.url);
      } catch (error) {
        console.error("Error getting file size:", error);
        fileSize = Infinity; // Default ke ukuran besar jika gagal
      }

      if (fileSize > fileSizeLimit) {
        // Jika file terlalu besar, kirim link
        const modifiedUrl = data.url.replace("dl=1", "dl=0");
        return message.reply({
          content: `[File too large! Download link:](${modifiedUrl})`,
          allowedMentions: { repliedUser: false },
        });
      }

      // Jika ukuran aman, kirim sebagai attachment
      message.reply({
        content: "",
        files: [{ attachment: data.url, name: "x.mp4" }],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error(error);
      // Coba kirim link jika error kemungkinan karena ukuran file
      if (data?.url) {
        const modifiedUrl = data.url.replace("dl=1", "dl=0");
        message.channel.send(
          `❌ Video too large, try downloading: ${modifiedUrl}`
        );
      } else {
        message.channel.send(
          "❌ An error occurred while retrieving the video."
        );
      }
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

async function getFileSize(url) {
  try {
    // Coba metode HEAD terlebih dahulu (lebih cepat)
    const response = await axios.head(url, { maxRedirects: 5 });
    const contentLength = response.headers["content-length"];

    if (contentLength) {
      return parseInt(contentLength, 10);
    } else {
      console.warn("Warning: No Content-Length header found. Trying GET request...");
    }
  } catch (error) {
    console.error("HEAD request failed:", error.message);
  }

  // Jika HEAD gagal atau tidak ada Content-Length, coba GET
  try {
    const response = await axios.get(url, { method: "GET", responseType: "stream", maxRedirects: 5 });
    return parseInt(response.headers["content-length"], 10) || Infinity;
  } catch (error) {
    console.error("GET request failed:", error.message);
    return Infinity; // Default ke ukuran besar jika gagal
  }
}

