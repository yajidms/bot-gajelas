const { EmbedBuilder } = require("discord.js");

module.exports = {
  sendLog: async (client, channelId, logDetails) => {
    try {
      // Validate logDetails parameter
      if (!logDetails || typeof logDetails !== "object") {
        console.error("logDetails is invalid or empty!"); // logDetails tidak valid atau kosong!
        return;
      }

      const logChannel = client.channels.cache.get(channelId);
      if (!logChannel) {
        console.error(`Log channel with ID ${channelId} not found!`); // Channel log dengan ID ${channelId} tidak ditemukan!
        return;
      } // Prepare footer text

      let footerText = "";
      if (logDetails.userId && logDetails.messageId) {
        footerText = `User ID: ${logDetails.userId} | Message ID: ${logDetails.messageId}`; // ID User: ${logDetails.userId} | ID Pesan: ${logDetails.messageId}
      } else if (logDetails.userId) {
        footerText = `User ID: ${logDetails.userId}`; // ID User: ${logDetails.userId}
      } else if (logDetails.messageId) {
        footerText = `Message ID: ${logDetails.messageId}`; // ID Pesan: ${logDetails.messageId}
      } // Fallback default values for logDetails

      const embed = new EmbedBuilder()
        .setColor(logDetails.color || 0x00ffed)
        .setAuthor({
          name: logDetails.author?.name || "Bot System", // Bot System
          iconURL:
            logDetails.author?.icon_url || client.user.displayAvatarURL(),
        })
        .setTitle(logDetails.title || "Log Notification") // Log Notification
        .setDescription(logDetails.description || "No description provided.") // Tidak ada deskripsi yang diberikan.
        .addFields(logDetails.fields || [])
        .setFooter({ text: footerText || "Unknown" }) // Tidak Diketahui
        .setTimestamp(logDetails.timestamp || Date.now());
      const channel = client.channels.cache.get(channelId);
      if (!channel) throw new Error(`Channel with ID ${channelId} not found.`); // Channel dengan ID ${channelId} tidak ditemukan.

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error sending log to channel ${channelId}:`, error); // Error mengirim log ke channel ${channelId}:
    }
  },
};
