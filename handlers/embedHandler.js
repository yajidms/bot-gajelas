const axios = require("axios");
const { getEmbedDetectionStatus } = require("../commands/toggleembed"); // Import status
const { sendLog } = require("../handlers/logHandler"); // Import logging function

module.exports = {
  handleEmbed: async (message, client) => {
    // Check if embed detection is enabled
    if (!getEmbedDetectionStatus()) return; // If disabled, exit the function // Check if the message contains a link

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (urls) {
      // List of domains supported by the bot for embeds
      const supportedDomains = [
        "reddit.com",
        "instagram.com",
        "tiktok.com",
        "x.com",
        "ifunny.co",
      ];

      for (const url of urls) {
        const isSupported = supportedDomains.some((domain) =>
          url.includes(domain)
        );

        if (isSupported) {
          try {
            // Suppress automatic embeds only for supported links
            await message.suppressEmbeds(true); // Retrieve the embed link using an external API

            const embedUrl = await getEmbedUrl(url, client);

            if (embedUrl) {
              // Send the reformatted embed link
              await message.reply(embedUrl);
            } else {
              const noEmbedMessage = "Embed URL not found.";
              console.error(noEmbedMessage); // Send log to log channel

              await sendLog(client, process.env.LOG_CHANNEL_ID, {
                title: "Embed Not Found",
                description: noEmbedMessage,
                color: 0xffa500,
                fields: [{ name: "URL", value: url, inline: false }],
              });

              await message.reply(
                "Sorry, there was a problem fetching the embed for this link."
              );
            }
          } catch (error) {
            const errorMessage = `Error while handling embed link: ${error.message}`;
            console.error(errorMessage); // Send log to log channel

            await sendLog(client, process.env.LOG_CHANNEL_ID, {
              title: "Embed Handler Error",
              description: errorMessage,
              color: 0xff0000,
              fields: [{ name: "URL", value: url, inline: false }],
            });

            await message.reply(
              "Sorry, an error occurred while processing this embed link. Please try again later."
            );
          }
        }
      }
    }
  },
};

async function getEmbedUrl(url, client) {
  try {
    const response = await axios.get(
      `https://embedez.com/api/v1/providers/combined?q=${encodeURIComponent(
        url
      )}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.EMBED_EZ_API_KEY}`,
        },
      }
    ); // Check if the embed data is valid

    if (
      response.data &&
      response.data.success &&
      response.data.data &&
      response.data.data.key
    ) {
      return `[Click to view Link](https://embedez.com/embed/${response.data.data.key})`;
    } else {
      const noEmbedMessage = "Embed URL not found in response.";
      console.error(noEmbedMessage); // Send log to log channel

      await sendLog(client, process.env.LOG_CHANNEL_ID, {
        title: "Invalid Embed",
        description: noEmbedMessage,
        color: 0xffa500,
        fields: [{ name: "URL", value: url, inline: false }],
      });

      throw new Error(noEmbedMessage);
    }
  } catch (error) {
    const apiErrorMessage = `Error while fetching embed URL: ${error.message}`;
    console.error(apiErrorMessage); // Send log to log channel

    await sendLog(client, process.env.LOG_CHANNEL_ID, {
      title: "Embed API Error",
      description: apiErrorMessage,
      color: 0xff0000,
      fields: [{ name: "URL", value: url, inline: false }],
    });

    throw error;
  }
}
