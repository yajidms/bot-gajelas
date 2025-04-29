const {
  SlashCommandBuilder,
  ChannelType,
  EmbedBuilder,
} = require("discord.js");
const {
  activeAIChats,
  getGeminiModel,
  safetySettings,
  readAttachment,
  splitMessage,
  GEMINI_MODEL_NAME,
} = require("../handlers/aiChatState");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("aichat")
    .setDescription(
      "Start a chat session with Gemini 2.5 Flash AI in this forum thread."
    )
    .addStringOption((option) =>
      option
        .setName("initial_prompt")
        .setDescription("First message or topic (optional).")
    )
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Upload a file (text, pdf, docx, etc) for the AI.")
        .setRequired(false)
    ),
  async execute(interaction) {
    await handleAIChatBegin(interaction);
  },
};

async function handleAIChatBegin(interaction) {
  const user = interaction.user;
  const channel = interaction.channel;
  const initialPrompt = interaction.options.getString("initial_prompt") || "";
  const attachment = interaction.options.getAttachment("file");
  const modelDisplayName = GEMINI_MODEL_NAME;

  // Only allow in forum threads
  if (
    channel.type !== ChannelType.PublicThread &&
    channel.type !== ChannelType.PrivateThread
  ) {
    await interaction.reply({
      content: "This command can only be used inside a forum post (thread).",
      ephemeral: true,
    });
    return;
  }

  // Prevent multiple sessions in the same thread
  if (activeAIChats.has(channel.id)) {
    await interaction.reply({
      content: "There is already an active AI chat session in this thread.",
      ephemeral: true,
    });
    return;
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    let fileContent = "";
    let fileReadingMessage = "";

    // Read attachment if present
    if (attachment) {
      await interaction.editReply({
        content: `Reading file \`${attachment.name}\`...`,
        ephemeral: true,
      });
      try {
        fileContent = await readAttachment(attachment);
        fileReadingMessage = `\nFile \`${attachment.name}\` read successfully.`;
      } catch (readError) {
        fileReadingMessage = `\n⚠️ Failed to read file \`${attachment.name}\`. Chat started without file.`;
        fileContent = "";
      }
    }

    // Combine prompt & file content
    let fullInitialPrompt = initialPrompt;
    if (fileContent) {
      fullInitialPrompt += `\n\n--- File Content: ${attachment.name} ---\n${fileContent}\n--- End of File ---`;
    }

    // Start chat session with Gemini 2.5 Flash
    const model = getGeminiModel();
    const chatSession = model.startChat({
      generationConfig: {},
      safetySettings,
    });

    // Save state
    activeAIChats.set(channel.id, {
      chatSession,
      userId: user.id,
      modelName: modelDisplayName,
    });

    // Send welcome message
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#4285F4")
      .setTitle(`🤖 Gemini Chat Session Started`)
      .setDescription(
        `Hello ${user}! You are now connected to ${modelDisplayName}.${
          attachment
            ? `\n\nFile \`${attachment.name}\`${
                fileReadingMessage.includes("successfully")
                  ? " has been included"
                  : " failed to read and was not included"
              }.`
            : ""
        }\n\nStart your conversation. Use \`/aichat_end\` to finish.`
      )
      .setFooter({ text: `Powered by Google Gemini (${modelDisplayName})` })
      .setTimestamp();

    // Send initial prompt if any
    let initialResponseText = null;
    if (fullInitialPrompt.trim()) {
      try {
        await channel.sendTyping();
        const initialResult = await chatSession.sendMessage(fullInitialPrompt);
        if (!initialResult?.response)
          throw new Error("Initial API response invalid.");
        initialResponseText = initialResult.response.text();
      } catch (error) {
        initialResponseText = `*Error processing initial prompt: ${error.message}*`;
      }
    }

    // Send welcome & initial response
    await channel.send({ embeds: [welcomeEmbed] });
    if (initialResponseText) {
      const chunks = splitMessage(initialResponseText);
      for (const chunk of chunks) {
        await channel.send(chunk);
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Notify user
    await interaction.editReply({
      content: `Gemini chat session is ready in this thread.${fileReadingMessage}`,
      ephemeral: true,
    });
  } catch (error) {
    const errorMsg = `Fatal error starting ${modelDisplayName} session.`;
    try {
      if (interaction.replied || interaction.deferred)
        await interaction.followUp({ content: errorMsg, ephemeral: true });
      else await interaction.reply({ content: errorMsg, ephemeral: true });
    } catch {}
    if (activeAIChats.has(channel.id)) activeAIChats.delete(channel.id);
  }
}