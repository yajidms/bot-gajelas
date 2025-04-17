const axios = require("axios");
const { AttachmentBuilder } = require("discord.js");

// Fungsi untuk mendapatkan ukuran file sebelum diunggah
async function getFileSize(url) {
  try {
    let response = await axios.head(url);
    return parseInt(response.headers["content-length"], 10);
  } catch (error) {
    console.error("Gagal mendapatkan ukuran file:", error);
    return Infinity; // Kembalikan ukuran besar jika gagal
  }
}

const urlPattern = /^https?:\/\/\S+/i;

async function handleX(msg) {
  const args = msg.content.trim().split(/ +/);
  const command = args[0].replace(/^f\./, "");
  if (command === "x") {
    if (urlPattern.test(args[1])) {
      let messageContent = args.slice(2).join(" ");
      const url = `https://api.ryzendesu.vip/api/downloader/twitter?url=${args[1]}`;
      const member = msg.member?.nickname ? msg.member : msg.author;
      let memer = member.nickname || member.username;

      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
          },
        });
        const data = response.data.media[0];

        if (!member) return msg.reply("Error unexpected");

        msg.delete().catch(() => {});
        console.log(data);

        try {
          let fileSizeLimit = 8 * 1024 * 1024; // Discord membatasi unggahan file max 8MB
          let fileSize = await getFileSize(data.url);

          if (fileSize > fileSizeLimit) {
            // Jika file terlalu besar, kirimkan URL saja
            let url = data.url;
            let modifiedUrl = url.replace("dl=1", "dl=0");
            msg.channel.send(`[${messageContent || "᲼"}](${modifiedUrl})`);
          } else {
            // Jika file masih dalam batas aman, kirim sebagai attachment
            let attachment = new AttachmentBuilder(data.url, {
              name: "x.mp4",
            });
            await msg.channel.send({
              content: `${messageContent} <@${msg.author.id}>`,
              files: [attachment],
              allowedMentions: { parse: [] }
            });
          }
        } catch (e) {
          if (e.code === 40005) {
            // Entity request too large
            let url = data.url;
            let modifiedUrl = url.replace("dl=1", "dl=0");
            msg.channel.send(`[${messageContent || "_"}](${modifiedUrl})`);
          } else {
            console.error(e);
            msg.channel.send(`Error, coba lagi!.`);
          }
        }
      } catch (e) {
        console.error(e);
        msg.channel.send(`Error, coba lagi!.`);
      }
    }
  }
}

module.exports = { handleX };
