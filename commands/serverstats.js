const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('serverstats')
      .setDescription('Displaying CPU and RAM usage from the bot server'),

  async execute(interaction) {
    // CPU Usage
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCores = cpus.length;

    // Calculate CPU usage
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpuCores;

    // RAM Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // Uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    // Format bytes to readable
    const formatBytes = (bytes) => {
      const gb = bytes / (1024 ** 3);
      return `${gb.toFixed(2)} GB`;
    };

    const embed = new EmbedBuilder()
        .setTitle('📊 Server Stats (Droplet)')
        .setColor('#0099ff')
        .addFields(
            { name: '🖥️ CPU Model', value: cpuModel, inline: false },
            { name: '⚙️ CPU Cores', value: `${cpuCores}`, inline: true },
            { name: '📈 CPU Usage', value: `${cpuUsage.toFixed(2)}%`, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: '💾 RAM Total', value: formatBytes(totalMem), inline: true },
            { name: '📊 RAM Used', value: formatBytes(usedMem), inline: true },
            { name: '📉 RAM Usage', value: `${memUsagePercent.toFixed(2)}%`, inline: true },
            { name: '⏱️ Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: false },
            { name: '🖧 Platform', value: `${os.platform()} ${os.arch()}`, inline: true },
            { name: '🏷️ Hostname', value: os.hostname(), inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'Stats Server Hosting' });

    await interaction.reply({ embeds: [embed] });
  }
};