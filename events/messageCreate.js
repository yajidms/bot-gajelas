const { handleEmbed } = require("../handlers/embedHandler");
const {
  activeAIChats,
  readAttachment: readAttachmentState,
  splitMessage: splitMessageState,
  switchGeminiKey,
  getGeminiModel,
} = require("../handlers/aiChatState");
const { handleAiChat: handlePrefixAiChat } = require("../handlers/aiHandler");
const { sendLog } = require("../handlers/logHandler");

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (message.author.bot || !message.inGuild()) return;
    try {
      await handleEmbed(message, client);
    } catch (embedError) {
      console.error("[MessageCreate] Error in handleEmbed:", embedError);
    }
    if (activeAIChats.has(message.channel.id)) {
      const chatData = activeAIChats.get(message.channel.id);

      // Only process messages from the user who started this session
      if (message.author.id !== chatData.userId) return;

      // === Active /aichat Session Handling Logic ===
      const { chatSession, modelName } = chatData;
      let userMessageContent = message.content || "";
      let fileInfoText = "";
      let combinedContentForAI = userMessageContent;

      // Read attachments in this message (use readAttachment from aiChatState)
      if (message.attachments?.size > 0) {
        await message.channel.sendTyping().catch(console.error);
        const fileContents = [];
        const fileNames = [];
        const readingMsg = await message
          .reply({
            content: `Analyzing ${message.attachments.size} file(s)...`,
            allowedMentions: { repliedUser: false },
          })
          .catch(console.error);

        for (const attachment of message.attachments.values()) {
          fileNames.push(`\`${attachment.name}\``);
          try {
            // Use readAttachment from aiChatState
            const content = await readAttachmentState(attachment);
            if (!content.startsWith("[Failed to read file")) {
              fileContents.push(
                `\n\n--- File: ${attachment.name} ---\n${content}\n--- End File ---`
              );
            } else {
              fileContents.push(
                `\n\n[Notify: Failed to read ${attachment.name}]`
              );
              await message.channel
                .send(`⚠️ Failed to read file ${attachment.name}.`)
                .catch(console.error);
            }
          } catch (readError) {
            fileContents.push(`\n\n[Error reading file: ${attachment.name}]`);
            await message.channel
              .send(`⚠️ Error reading file ${attachment.name}.`)
              .catch(console.error);
          }
        }
        if (readingMsg) await readingMsg.delete().catch(console.error);
        if (fileContents.length > 0) {
          combinedContentForAI += fileContents.join("");
          fileInfoText = ` (inc ${fileNames.join(", ")})`;
        }
      }

      if (!combinedContentForAI.trim()) return;

      // Send to Gemini (Active Session)
      try {
        await message.channel.sendTyping().catch(console.error);
        console.log(
          `[AI Session Msg] Send to ${modelName}${fileInfoText}. Len: ${combinedContentForAI.length}`
        );
        const result = await chatSession.sendMessage(combinedContentForAI);
        if (!result?.response) throw new Error("Invalid/Blocked API Response.");
        if (result.response.promptFeedback?.blockReason) {
          return;
        }
        const aiTextResponse = result.response.text();
        const finishReason = result.response.candidates?.[0]?.finishReason;
        console.log(
          `[AI Session Msg] Received from ${modelName}. Len: ${aiTextResponse?.length}, Reason: ${finishReason}`
        );
        if (!aiTextResponse?.trim()) {
          return;
        } else {
          // Send reply (split using splitMessageState)
          const chunks = splitMessageState(aiTextResponse);
          let replyTo = message;
          for (let i = 0; i < chunks.length; i++) {
            try {
              replyTo = await replyTo.reply({
                content: chunks[i],
                allowedMentions: { repliedUser: false },
              });
              if (i < chunks.length - 1)
                await new Promise((r) => setTimeout(r, 300));
            } catch (sendError) {
              break;
            }
          }
        }
      } catch (error) {
        console.error(
          `[${message.channel.id}] Gemini Session Error (${modelName}):`,
          error
        );
        let replyMsg = "AI communication error.";
        await message
          .reply({ content: replyMsg, allowedMentions: { repliedUser: false } })
          .catch(console.error);
      }
      return;
    }
    try {
      await handlePrefixAiChat(message);
    } catch (prefixError) {
      console.error(
        "[MessageCreate] Error when running handlePrefixAiChat:",
        prefixError
      );
    }
  },
};