const { EmbedBuilder } = require("discord.js");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(client, oldMessage, newMessage) {
    // Pastikan pesan bukan dari bot dan konten pesan berubah
    if (
      !oldMessage.author ||
      oldMessage.author.bot ||
      oldMessage.content === newMessage.content
    )
      return;

    const logChannelId = process.env.LOG_CHANNEL_ID; // Ambil ID channel log

    // Membuat embed untuk pesan yang diedit
    const logDetails = {
      color: 0xffcc00, // Warna embed
      title: `message edited on https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${newMessage.id}`,
      description: `**before**:\n${oldMessage.content}\n\n**after**:\n${newMessage.content}`,
      author: {
        name: oldMessage.author.tag,
        icon_url: oldMessage.author.displayAvatarURL(),
      },
      fields: [],
      footer: {
        text: `ID User: ${oldMessage.author.id} | ID Message: ${newMessage.id}`,
      },
      timestamp: Date.now(),
      userId: oldMessage.author.id, // Tambahkan ID Pengguna
      messageId: newMessage.id, // Tambahkan ID Pesan yang diedit
    };

    // Mengirim log ke channel log
    await sendLog(client, logChannelId, logDetails);
  },
};
