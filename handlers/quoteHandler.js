const cron = require("node-cron");
const axios = require("axios");
const moment = require("moment-timezone");
const { EmbedBuilder } = require("discord.js");
require("dotenv").config();

// Function to fetch Quote of the Day from ZenQuotes API
async function getQuoteOfTheDay() {
  try {
    const response = await axios.get("https://zenquotes.io/api/random");
    const quote = response.data[0].q;
    const author = response.data[0].a;
    return { quote, author };
  } catch (error) {
    console.error("Error fetching quote:", error);
    return { quote: null, author: null };
  }
}

// Function to send QOTD to Discord channel with embed format
async function sendQOTD(client) {
  const channel = await client.channels.fetch(process.env.QUOTE_CHANNEL_ID);
  if (!channel) {
    console.error("Channel not found!"); // Channel tidak ditemukan!
    return;
  }

  const { quote, author } = await getQuoteOfTheDay();
  if (quote && author) {
    const embed = new EmbedBuilder()
      .setColor(0x00ffed) // Embed color
      .setTitle("Quote of the Day") // Embed title
      .setDescription(`"${quote}"`) // QOTD content
      .setFooter({ text: `- ${author}` }) // Author name in footer
      .setTimestamp(); // Timestamp
    channel.send({ embeds: [embed] });
    console.log("QOTD sent successfully"); // QOTD berhasil dikirim
  } else {
    console.error("Failed to get Quote of the Day"); // Gagal mendapatkan Quote of the Day
  }
}

// Scheduling QOTD based on time from .env (format HH:mm UTC time)
function scheduleQOTD(client) {
  const [utcHour, utcMinute] = process.env.QOTD_TIME.split(":").map(Number);

  cron.schedule(`${utcMinute} ${utcHour} * * *`, () => {
    sendQOTD(client);
  }); // Format hour and minute with leading zero

  const formattedHour = utcHour.toString().padStart(2, "0");
  const formattedMinute = utcMinute.toString().padStart(2, "0");

  console.log(
    `QOTD scheduled daily at ${formattedHour}:${formattedMinute} UTC.`
  ); // QOTD dijadwalkan setiap hari pada ${formattedHour}:${formattedMinute} UTC.
}

// Function to get QOTD for user (via command), send embed
async function getQOTDForUser() {
  const { quote, author } = await getQuoteOfTheDay();
  if (!quote || !author) {
    return "Failed to get Quote of the Day. Please try again later!"; // Gagal mendapatkan Quote of the Day. Coba lagi nanti!
  }

  const embed = new EmbedBuilder()
    .setColor(0x00ffed) // Embed color
    .setTitle("Quote of the Day") // Embed title
    .setDescription(`"${quote}"`) // QOTD Content
    .setFooter({ text: `- ${author}` }) // Author name in footer
    .setTimestamp(); // Timestamp
  return { embeds: [embed] };
}

module.exports = { scheduleQOTD, sendQOTD, getQOTDForUser };
