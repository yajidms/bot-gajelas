const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
require('dotenv').config();

async function registerCommands(client) {
    if (!client.commands || client.commands.size === 0) {
        console.error('❌ Tidak ada command yang ditemukan! Pastikan loadCommands(client) sudah dijalankan.');
        return;
    }

    const commands = client.commands.map(command => command.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('🚀 Mendaftarkan slash commands ke Discord secara global...');

        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });

        console.log('✅ Slash commands global berhasil didaftarkan!');
        console.log('⚠️ Perubahan command global bisa butuh waktu hingga 1 jam untuk diperbarui.');
    } catch (error) {
        console.error('❌ Gagal mendaftarkan commands:', error);
    }
}

module.exports = { registerCommands };
