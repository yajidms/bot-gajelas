const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays a list of all commands."),
  async execute(interaction) {
    // Create embed for command list
    const commandsList = interaction.client.commands
      .map((cmd) => `**/${cmd.data.name}**: ${cmd.data.description}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x00ffed)
      .setTitle("Command List")
      .setDescription(
        `Here is a list of available commands:\n\n${commandsList}`
      )
      .setFooter({ text: "Use these commands to interact with the bot" })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
