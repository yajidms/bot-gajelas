const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adzan")
    .setDescription("Retrieve the adzan schedule by city")
    .addStringOption(option =>
      option
        .setName("city")
        .setDescription("Name of the city to retrieve the adzan schedule")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "You can only run this command inside the server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const city = interaction.options.getString("city");
    const country = "Indonesia";

    try {
      const response = await axios.get("http://api.aladhan.com/v1/timingsByCity", {
        params: {
          city: city,
          country: country,
          method: 2,
        },
      });

      const timings = response.data.data.timings;
      const date = new Date();

      const formattedDate = date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const timezone = response.data.data.meta.timezone;
      const timeNow = new Date().toLocaleTimeString("en-GB", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
      });

      const adzanEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`Prayer Times | ${city.charAt(0).toUpperCase() + city.slice(1)}`)
        .setDescription(`${formattedDate}`)
        .addFields(
          { name: "Subuh", value: timings.Fajr, inline: false },
          { name: "Dzuhur", value: timings.Dhuhr, inline: false },
          { name: "Ashar", value: timings.Asr, inline: false },
          { name: "Magrib", value: timings.Maghrib, inline: false },
          { name: "Isya", value: timings.Isha, inline: false }
        )
        .setFooter({
          text: `Source: Aladhan API | ${country} • Today at ${timeNow}`,
        });

      await interaction.reply({ embeds: [adzanEmbed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `Failed to take the adzan schedule for ${city}. Make sure the city name is correct.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};