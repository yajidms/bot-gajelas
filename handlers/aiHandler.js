const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { sendLog } = require("./logHandler");

let aiStatus = true; // Status fitur AI, default aktif
const allowedChannels = process.env.ALLOWED_AI_CHANNELS.split(",");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
    handleAiChat: async (message) => {
        const prefix = "ai.chat";
        if (!message.content.startsWith(prefix)) return;

        // Hapus prefix untuk mendapatkan pertanyaan pengguna
        const userQuestion = message.content.slice(prefix.length).trim();
        if (!userQuestion) return message.reply("Please write down the issue you want to ask after `ai.chat`.");

        // Cek status fitur AI
        if (!aiStatus && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply("AI feature is currently disabled. Contact admin to enable this feature.");
        }

        // Cek apakah pesan berada di dalam thread atau di channel yang diperbolehkan
        const isInAllowedChannel = allowedChannels.includes(message.channel.id);
        const isInThread = message.channel.isThread(); // Mengecek apakah pesan berada di dalam thread
        const threadParentId = isInThread ? message.channel.parentId : null; // Mengambil parent ID jika berada di thread
        const isInAllowedThread = isInAllowedChannel ||
            (isInThread && allowedChannels.includes(threadParentId)); // Memastikan thread berada di channel yang diizinkan

        if (!isInAllowedChannel && !isInAllowedThread && !message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            // Membuat daftar channel yang diizinkan dalam format tag
            const allowedChannelTags = allowedChannels
                .map((channelId) => `<#${channelId}>`)
                .join(", ");

            // Kirim balasan berisi daftar channel yang diizinkan
            const replyMessage = await message.reply({
                content: `This feature can only be used in channels or threads ${allowedChannelTags}`,
            });

            // Hapus pesan balasan bot dan command pengguna setelah 5 detik
            setTimeout(async () => {
                try {
                    await message.delete(); // Hapus pesan pengguna
                    await replyMessage.delete(); // Hapus pesan balasan bot
                } catch (error) {
                    // Kirimkan log error ke log channel
                    const logFields = [
                        { name: "Error Message", value: error.message || "Tidak ada pesan error", inline: false },
                    ];

                    // Menambahkan informasi thread jika pesan berada di dalam thread
                    if (isInThread) {
                        logFields.push(
                            { name: "Channel", value: `#${message.channel.parent.name}`, inline: true },
                            { name: "Thread", value: `#${message.channel.name}`, inline: true }
                        );
                    } else {
                        logFields.push(
                            { name: "Channel", value: `#${message.channel.name}`, inline: true }
                        );
                    }

                    await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
                        author: {
                            name: message.client.user.tag,
                            icon_url: message.client.user.displayAvatarURL(),
                        },
                        title: "Error saat menghapus pesan",
                        description: "An error occurred while trying to delete a bot message or user command.",
                        fields: logFields,
                        timestamp: Date.now(),
                    });
                }
            }, 5000);

            return;
        }

        try {
            // Kirim prompt ke model AI
            const response = await model.generateContent(userQuestion);
            let answer = response.response.text();

            // Pisahkan jawaban menjadi beberapa bagian jika lebih dari 4096 karakter
            const answerParts = [];
            while (answer.length > 4096) {
                answerParts.push(answer.slice(0, 4096));
                answer = answer.slice(4096);
            }
            answerParts.push(answer); // Tambahkan sisa jawaban

            // Kirim embed pertama
            const firstEmbed = new EmbedBuilder()
                .setAuthor({
                    name: `Powered by Gemini AI`,
                    iconURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s",
                })
                .setTitle(`The answer to the question ${message.author.username}`)
                .setDescription(answerParts[0])
                .setFooter({
                    text: `These answers are generated by AI and may not be completely accurate.`,
                })
                .setTimestamp();

            let replyMessage;
            if (isInThread) {
                replyMessage = await message.channel.send({ embeds: [firstEmbed] });
            } else {
                replyMessage = await message.reply({ embeds: [firstEmbed] });
            }

            // Kirim embed lanjutan (jika ada)
            for (let i = 1; i < answerParts.length; i++) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `Powered by Gemini AI`,
                        iconURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s",
                    })
                    .setTitle(`Continued answer to the question ${message.author.username}`)
                    .setDescription(answerParts[i])
                    .setFooter({
                        text: `These answers are generated by AI and may not be completely accurate.`,
                    })
                    .setTimestamp();

                // Kirim embed tanpa tombol
                if (isInThread) {
                    await replyMessage.reply({ embeds: [embed] });
                } else {
                    await replyMessage.reply({ embeds: [embed] });
                }
            }

            // Log penggunaan AI
            const logFields = [
                { name: "User", value: `<@${message.author.id}>`, inline: true },
            ];

            // Menambahkan informasi thread jika pesan berada di dalam thread
            if (isInThread) {
                logFields.push(
                    { name: "Channel", value: `#${message.channel.parent.name}`, inline: true },
                    { name: "Thread", value: `#${message.channel.name}`, inline: true }
                );
            } else {
                logFields.push(
                    { name: "Channel", value: `#${message.channel.name}`, inline: true }
                );
            }

            await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
                author: {
                    name: message.author.tag,
                    icon_url: message.author.displayAvatarURL(),
                },
                title: "Use of AI Features",
                description: `**Question:** ${userQuestion}`,
                fields: logFields,
                userId: message.author.id,
            });
        } catch (error) {
            console.error("Error while processing AI request:");

            // Log error dengan Channel atau Thread yang relevan
            const errorLogFields = [
                { name: "Error Message", value: error.message || "No error message", inline: false },
                { name: "User", value: `<@${message.author.id}>`, inline: true },
            ];

            // Menambahkan informasi thread jika pesan berada di dalam thread
            if (isInThread) {
                errorLogFields.push(
                    { name: "Channel", value: `#${message.channel.parent.name}`, inline: true },
                    { name: "Thread", value: `#${message.channel.name}`, inline: true }
                );
            } else {
                errorLogFields.push(
                    { name: "Channel", value: `#${message.channel.name}`, inline: true }
                );
            }

            // Kirimkan log error ke log channel
            await sendLog(message.client, process.env.LOG_CHANNEL_ID, {
                author: {
                    name: message.client.user.tag,
                    icon_url: message.client.user.displayAvatarURL(),
                },
                title: "Error saat memproses AI",
                description: `An error occurred while processing the question: ${userQuestion}`,
                fields: errorLogFields,
                userId: message.author.id,
                timestamp: Date.now(),
            });
        
            // Beri tahu pengguna tentang kesalahan
            await message.reply("An error occurred while processing your request. Please contact Admin.");
        }        
    },

    toggleAiStatus: (status) => {
        aiStatus = status;
    },

    getAiStatus: () => aiStatus,
};