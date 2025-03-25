const axios = require("axios");
const { getEmbedDetectionStatus } = require("../commands/toggleembed");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  handleEmbed: async (message, client) => {
    if (!getEmbedDetectionStatus()) return;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = message.content.match(urlRegex);

    if (urls) {
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
            await message.suppressEmbeds(true);
            const embedUrl = await getEmbedUrl(url, client);

            if (embedUrl) {
              await message.reply({
                content: embedUrl,
                allowedMentions: { repliedUser: false },
              });
            } else {
              const noEmbedMessage = "Embed URL not found.";
              console.error(noEmbedMessage);

              await sendLog(client, process.env.LOG_CHANNEL_ID, {
                title: "Embed Not Found",
                description: noEmbedMessage,
                color: 0xffa500,
                fields: [{ name: "URL", value: url, inline: false }],
              });

              await message.reply({
                content:
                  "Sorry, there was a problem fetching the embed for this link.",
                allowedMentions: { repliedUser: false },
              });
            }
          } catch (error) {
            const errorMessage = `Error while handling embed link: ${error.message}`;
            console.error(errorMessage);

            await sendLog(client, process.env.LOG_CHANNEL_ID, {
              title: "Embed Handler Error",
              description: errorMessage,
              color: 0xff0000,
              fields: [{ name: "URL", value: url, inline: false }],
            });

            await message.reply({
              content:
                "Sorry, an error occurred while processing this embed link. Please try again later.",
              allowedMentions: { repliedUser: false },
            });
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
    );

    if (response.data?.success && response.data.data?.key) {
      return `[Click to view Link](https://embedez.com/embed/${response.data.data.key})`;
    } else {
      const noEmbedMessage = "Embed URL not found in response.";
      console.error(noEmbedMessage);

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
    console.error(apiErrorMessage);

    await sendLog(client, process.env.LOG_CHANNEL_ID, {
      title: "Embed API Error",
      description: apiErrorMessage,
      color: 0xff0000,
      fields: [{ name: "URL", value: url, inline: false }],
    });

    throw error;
  }
}
