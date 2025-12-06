const { EmbedBuilder } = require("discord.js");

module.exports = {
  sendLog: async (client, channelId, logDetails) => {
    try {
      if (!logDetails || typeof logDetails !== "object") {
        console.error("logDetails is invalid or empty!"); 
        return;
      }

      const logChannel = client.channels.cache.get(channelId);
      if (!logChannel) {
        console.error(`Log channel with ID ${channelId} not found!`); 
        return;
      } 

      let footerText = "";
      if (logDetails.userId && logDetails.messageId) {
        footerText = `User ID: ${logDetails.userId} | Message ID: ${logDetails.messageId}`; 
      } else if (logDetails.userId) {
        footerText = `User ID: ${logDetails.userId}`; 
      } else if (logDetails.messageId) {
        footerText = `Message ID: ${logDetails.messageId}`; 
      } 

      const embed = new EmbedBuilder()
        .setColor(logDetails.color || 0x00ffed)
        .setAuthor({
          name: logDetails.author?.name || "Bot System", 
          iconURL:
            logDetails.author?.icon_url || client.user.displayAvatarURL(),
        })
        .setTitle(logDetails.title || "Log Notification") 
        .setDescription(logDetails.description || "No description provided.") 
        .addFields(logDetails.fields || [])
        .setFooter({ text: footerText || "Unknown" }) 
        .setTimestamp(logDetails.timestamp || Date.now());
      const channel = client.channels.cache.get(channelId);
      if (!channel) throw new Error(`Channel with ID ${channelId} not found.`); 

      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`Error sending log to channel ${channelId}:`, error); 
    }
  },
};
