const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");
const pptx2json = require("pptx2json");
const Tesseract = require("tesseract.js");
require("dotenv").config();

const geminiKeys = [process.env.GEMINI_API_KEY];

let currentGeminiKeyIndex = 0;

function getActiveGeminiKey() {
  if (geminiKeys.length === 0) {
    throw new Error("No valid GEMINI_API_KEY found in the .env file");
  }
  return geminiKeys[currentGeminiKeyIndex];
}

function switchGeminiKey() {
  if (geminiKeys.length > 1) {
    currentGeminiKeyIndex = (currentGeminiKeyIndex + 1) % geminiKeys.length;
    console.log(
      `[AI Key] Switching to Gemini Key Index: ${currentGeminiKeyIndex}`
    );
  } else {
    console.log("[AI Key] Only 1 Gemini API key available, cannot switch.");
  }
}

const GEMINI_MODEL_NAME = "Gemini 2.5 Flash";
const GEMINI_INTERNAL_ID = "gemini-2.5-flash-preview-04-17";

/**
 * @param {string} modelTypeIndicator
 * @returns {GenerativeModel}
 */
function getGeminiModel() {
  const targetModelId = GEMINI_INTERNAL_ID;
  const key = getActiveGeminiKey();
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: targetModelId });
}

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const activeAIChats = new Map();

async function readAttachment(attachment) {
  const url = attachment.url;
  const name = attachment.name.toLowerCase();
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) {
    console.log(`[File Read] Creating temporary directory: ${tempDir}`);
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const tempPath = path.join(
    tempDir,
    `${Date.now()}_${attachment.id}_${path.basename(name)}`
  );
  console.log(`[File Read] Downloading attachment: ${name} to ${tempPath}`);

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 30000,
    });
    fs.writeFileSync(tempPath, response.data);
    console.log(
      `[File Read] Download successful: ${name} (${response.data.length} bytes)`
    );
    const codeExtensions = [ ".txt", ".js", ".ts", ".jsx", ".tsx", ".py", ".java", ".c", ".cpp", ".cs", ".rb", ".go", ".php", ".swift", ".kt", ".kts", ".rs", ".scala", ".sh", ".bat", ".pl", ".lua", ".r", ".m", ".vb", ".dart", ".html", ".css", ".scss", ".less", ".json", ".xml", ".yml", ".yaml", ".md", ".ini", ".cfg", ".toml", ".sql", ".asm", ".s", ".h", ".hpp", ".vue", ".coffee", ".erl", ".ex", ".exs", ".fs", ".fsx", ".groovy", ".jl", ".lisp", ".clj", ".cljs", ".ml", ".mli", ".nim", ".ps1", ".psm1", ".psd1", ".rkt", ".vb", ".vbs", ".v", ".sv", ".svelte", ".jar" ];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    const documentExtensions = [".pdf", ".docx", ".xlsx", ".xls", ".pptx"];

    let text = `[File Name: ${name}]\n`;
    const stats = fs.statSync(tempPath);

    if (stats.size === 0) {
      text += "[Empty File]";
      console.log(`[File Read] File ${name} is empty.`);
    } else if (codeExtensions.some((ext) => name.endsWith(ext))) {
      text += fs.readFileSync(tempPath, "utf8");
      console.log(`[File Read] ${name} read as text/code.`);
    } else if (imageExtensions.some((ext) => name.endsWith(ext))) {
      text += `[Image Info: size ${stats.size} bytes]\n`;
      if (!name.endsWith(".gif")) {
        try {
          const ocrResult = await Tesseract.recognize(tempPath, "eng", {
            logger: (m) => console.log(`[OCR ${name}] ${m.status}...`),
          });
          text += `\n[OCR Result Start]\n${
            ocrResult.data.text.trim() || "(Text not detected)"
          }\n[OCR Result End]`;
          console.log(`[File Read] OCR finished: ${name}.`);
        } catch (e) {
          console.error(`[File Read] OCR Error ${name}:`, e);
          text += "\n[OCR Failed]";
        }
      } else {
        text += "[OCR skipped for GIF]";
      }
    } else if (name.endsWith(".pdf")) {
      try {
        text += (await pdfParse(fs.readFileSync(tempPath))).text;
        console.log(`[File Read] ${name} read as PDF.`);
      } catch (e) {
        text += "[Failed to read PDF]";
        console.error(`[File Read] PDF Error ${name}:`, e);
      }
    } else if (name.endsWith(".docx")) {
      try {
        text += (await mammoth.extractRawText({ path: tempPath })).value;
        console.log(`[File Read] ${name} read as DOCX.`);
      } catch (e) {
        text += "[Failed to read DOCX]";
        console.error(`[File Read] DOCX Error ${name}:`, e);
      }
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      try {
        const wb = XLSX.readFile(tempPath);
        text += wb.SheetNames.map(
          (sn) => `Sheet: ${sn}\n${XLSX.utils.sheet_to_csv(wb.Sheets[sn])}`
        ).join("\n\n");
        console.log(`[File Read] ${name} read as Excel.`);
      } catch (e) {
        text += "[Failed to read Excel]";
        console.error(`[File Read] Excel Error ${name}:`, e);
      }
    } else if (name.endsWith(".pptx")) {
      try {
        const s = await pptx2json(tempPath);
        text += s
          .map((sl, i) => `Slide ${i + 1}:\n${sl.texts?.join("\n") ?? ""}`)
          .join("\n\n");
        console.log(`[File Read] ${name} read as PPTX.`);
      } catch (e) {
        text += "[Failed to read PPTX]";
        console.error(`[File Read] PPTX Error ${name}:`, e);
      }
    } else {
      text += "[Unsupported file type]";
      console.log(`[File Read] Type ${name} is not supported.`);
    }

    const MAX_FILE_LEN = 20000;
    if (text.length > MAX_FILE_LEN) {
      text =
        text.substring(0, MAX_FILE_LEN) +
        `\n\n[File Content ${name} Truncated...]`;
      console.warn(`[File Read] Content of ${name} truncated.`);
    }
    return text;
  } catch (error) {
    console.error(`[File Read] Failed to process attachment ${name}:`, error);
    return `[Failed to read file: ${name} - Error: ${
      error.message || "Unknown"
    }]`;
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlink(tempPath, (err) => {
        if (err)
          console.error(`[File Read] Failed to delete temp ${tempPath}:`, err);
        else console.log(`[File Read] Deleted temp: ${tempPath}`);
      });
    }
  }
}

function splitMessage(text, maxLength = 1990) {
  if (typeof text !== "string") text = String(text);
  if (text.length <= maxLength) return [text];
  const chunks = [];
  let currentChunk = "";
  const lines = text.split("\n");
  for (const line of lines) {
    if (currentChunk.length === 0 && line.length > maxLength) {
      for (let i = 0; i < line.length; i += maxLength)
        chunks.push(line.substring(i, i + maxLength));
    } else if (currentChunk.length + line.length + 1 <= maxLength) {
      currentChunk += line + "\n";
    } else {
      if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
      if (line.length > maxLength) {
        for (let i = 0; i < line.length; i += maxLength)
          chunks.push(line.substring(i, i + maxLength));
        currentChunk = "";
      } else {
        currentChunk = line + "\n";
      }
    }
  }
  if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
  if (chunks.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += maxLength)
      chunks.push(text.substring(i, i + maxLength));
  }
  return chunks.filter(Boolean);
}

module.exports = {
  activeAIChats,
  getGeminiModel,
  switchGeminiKey,
  safetySettings,
  readAttachment,
  splitMessage,
  GEMINI_MODEL_NAME,
};