const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('list-roles')
    .setDescription('Displays a list of all roles on this server')
    .setDMPermission(false),

  async execute(interaction) {
    const roles = interaction.guild.roles.cache
      .sort((a, b) => b.position - a.position)
      .filter(role => 
        role.name !== '@everyone' && 
        !role.managed &&
        role.id !== interaction.guild.id
      );

    const roleList = roles.size > 0
      ? roles.map(role => `<@&${role.id}>`).join(', ')
      : 'Tidak ada role selain @everyone';

    const rolesEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`Daftar Role di ${interaction.guild.name}`)
      .setDescription(roleList)
      .setFooter({ text: `Total: ${roles.size} roles` });

    await interaction.reply({ embeds: [rolesEmbed] });
  },
};