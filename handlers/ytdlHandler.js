const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const https = require("https");

async function getFileSize(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { method: "HEAD" }, (res) => {
        const length = res.headers["content-length"];
        if (length) resolve(parseInt(length));
        else reject(new Error("Can't get the file size"));
      })
      .on("error", reject);
  });
}

async function handleYtDownload(message) {
  const prefix = "f.yt";
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const urlPattern = /https?:\/\/\S+/;
  if (!args[0] || !urlPattern.test(args[0])) {
    return message.reply(
      "Enter a valid YouTube URL!\nExample: `f.yt https://youtube.com/...`"
    );
  }

  // Hapus pesan user
  await message.delete();

  const ytUrl = args[0];
  const apiUrl = `https://api.ryzendesu.vip/api/downloader/ytmp4?url=${ytUrl}&quality=480`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
      },
    });
    const data = response.data;

    const text = `**from :** <@${message.author.id}>\n\n**YouTube**
**Title:** ${data.title || "-"}
**Author:** ${data.author || "-"}
**Description:** ${data.description || "-"}`;

    let fileSizeLimit = 100 * 1024 * 1024;
    let fileSize = 0;
    let canSendAttachment = true;
    try {
      fileSize = await getFileSize(data.url);
      if (fileSize > fileSizeLimit) canSendAttachment = false;
    } catch (err) {
      // Tidak bisa dapat ukuran file, fallback ke link saja
      canSendAttachment = false;
    }

    if (!canSendAttachment) {
      // File terlalu besar atau tidak diketahui ukurannya, kirim link download + thumbnail
      let files = [];
      if (data.thumbnail) {
        files.push(
          new AttachmentBuilder(data.thumbnail, { name: "thumbnail.jpg" })
        );
      }
      await message.channel.send({
        content: `${text}\n\n[Download Video](${data.url})`,
        files,
        allowedMentions: { users: [] },
      });
    } else {
      // File cukup kecil, kirim sebagai attachment
      const attachment = new AttachmentBuilder(data.url, {
        name: "youtube.mp4",
      });
      await message.channel.send({
        content: text,
        files: [attachment],
        allowedMentions: { users: [] },
      });
    }
  } catch (e) {
    console.error(e);
    message.channel.send(`An error occurred: ${e.message}`);
  }
}

module.exports = { handleYtDownload };