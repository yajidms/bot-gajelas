# How to Use Furina Source Bot

Welcome to the Furina bot source. This bot is ready to destroy your server with a variety of unclear features. Follow these steps to get started:
[For those who want to use this Furina bot, click this blue text or link](https://discord.com/oauth2/authorize?client_id=1351007630092668988&permissions=8&integration_type=0&scope=bot)

## 📋 Prerequisites

Make sure you have VS Code or VS Codium installed (NEOVIM IS NOT SUPPORTED):

* **Node.js:** (Version 21 or later is recommended)
* **npm** or **yarn:** Node.js package manager

## ⚙️ Installation

1.  **Clone Repository:** Get the bot's code onto your computer.
    ```bash
    git clone https://github.com/yajidms/bot-gajelas.git
    cd bot-gajelas
    ```
2.  **Install Dependencies:** Install all the packages the bot requires.
    ```bash
    npm install
    # or if using yarn
    yarn install
    ```

## 🔑 Important Configuration (`.env`)

Create a file named `.env` in the project's root directory containing the API Keys, Bot ID, and User IDs. This is crucial for the bot to function correctly!

```dotenv
# --- Key Credentials ---
DISCORD_TOKEN=
CLIENT_ID=

# --- API Keys (Important for AI & Downloader Features) ---
# Gemini
GEMINI_API_KEY=

# Together AI or Deepinfra (For Llama & DeepSeek)
TOGETHER_API_KEY=
DEEPINFRA_KEY=

# --- Channel & Role IDs (Customize for your server) ---
# Logging
LOG_CHANNEL_ID=
DEV_LOG_CHANNEL_ID=

# Role
MUTED_ROLE_ID=
# Developer IDs (Separate with commas if more than one)
DEV_ID=ID1,ID2

# Guild (Server) IDs where the bot is active (Separate with commas if more than one)
GUILD_ID=
```

**Important:** Never share your `.env` file or bot token with anyone!

## ▶️ Running the Bot

Once the configuration is complete, run the bot using the command:

```bash
npm start
# or
node index.js
```

The bot will go online and be ready to receive commands!

## ✨ Main Features & Commands

This bot comes with various commands, accessible via both *prefix* and *slash commands* (`/`).

### 📥 Media Downloader (Prefix Command)

Use the prefix `f.` followed by the URL to download media:

* `f.ig <Instagram Reel URL>`: Download videos from Instagram Reels.
* `f.fb <Facebook Video URL>`: Download videos from Facebook.
* `f.tt <TikTok Video URL>`: Download videos from TikTok.
* `f.yt <YouTube Video URL>`: Download videos from YouTube (480p quality).
* `f.x <Twitter/X Video URL>`: Download videos from Twitter/X.

*Example:* `f.ig https://www.instagram.com/reel/example123/`

### 🧠 AI Features (Prefix & Slash Command)

Interact with advanced AI models:

* **Prefix Command:**
    * `f.geminipro <question>`: Ask Gemini Pro.
    * `f.geminiflash <question>`: Ask Gemini Flash.
    * `f.llama <question>`: Ask Llama.
    * `f.deepseek-r1 <question>`: Ask DeepSeek R1.
    * *(You can also attach files (txt, pdf, docx, xlsx, pptx, images) when using these commands!)*
* **Slash Command:**
    * `/aichat [initial_prompt] [file]`: Start an interactive chat session with Gemini 2.5 Flash within a forum *thread*. Attach files if needed.
    * `/aichat_end`: Ends the currently active `/aichat` session in the *thread*.

### 🛠️ Utilities (Slash Command)

Everyday helper commands:

* `/help`: Displays a list of all available *slash commands*.
* `/info`: Displays information about this bot.
* `/ping`: Checks the bot's latency and Discord API latency.
* `/avatar [user] [type]`: View a user's global or server avatar.
* `/banner [user] [type]`: View a user's global or server banner.
* `/userinfo [user]`: Displays detailed information about a Discord user.
* `/serverinfo`: Displays detailed information about the current server.
* `/list-roles`: Displays a list of all roles on the server.
* `/adzan [city]`: Displays prayer times for a specific city in Indonesia.

### 🛡️ Moderation (Slash Command)

Commands for maintaining server order (requires permissions):

* `/ban <user> [time] [reason]`: Bans a user from the server (can be temporary).
* `/unban <user_id>`: Revokes a user's ban based on their ID.
* `/kick <user> [reason]`: Kicks a user from the server.
* `/mute <user> [time] [reason]`: Prevents a user from sending messages (temporary or permanent).
* `/unmute <user>`: Revokes a user's muted status.
* `/timeout <user> <duration> [reason]`: Gives a user a timeout (cannot interact) for a specified duration.
* `/untimeout <user>`: Revokes a user's timeout status.
* `/clean-message <amount>`: Deletes a specified number of recent messages in the channel (requires Administrator permission).

### 🔒 Developer Commands (Slash Command)

Only for users whose IDs are listed in the `.env` file:

* `/restart`: Restarts the bot.
* `/say <message> [reply_to]`: Sends a message as the bot, can reply to another message.
* `/set status <type> <message> <duration>`: Sets the bot's online status (Online, Idle, DND, Invisible) and custom message.
* `/set activity <type> <message> <duration>`: Sets the bot's activity (Playing, Listening, Watching, Streaming).
* `/toggleembed <option>`: Enables or disables the automatic embed detection system.

---

Congratulations, the bot is ready! If you find any bugs or have suggestions, feel free to report them to this repository.

```
This section covers:
* Clear installation steps.
* Detailed explanation of the required `.env` configuration.
* How to run the bot.
* Summary of main features categorized (Downloader, AI, Utilities, Moderation, Developer).
* Usage examples for prefix commands.
* Use of markdown and emojis to make it visually appealing.
```

gajelas, tutup aja nih commit

Berikut adalah resep sederhana untuk membuat roti jahe (gingerbread cookies) yang renyah dan beraroma khas rempah:

Bahan:

350 g tepung terigu serbaguna

1 sdt baking soda

2 sdt bubuk jahe

1 sdt bubuk kayu manis

½ sdt bubuk pala

½ sdt garam

125 g mentega, suhu ruang

100 g gula palem

100 g madu atau molase

1 butir telur

Cara Membuat:

Campur bahan kering:

Ayak tepung terigu, baking soda, bubuk jahe, kayu manis, pala, dan garam dalam satu wadah. Sisihkan.

Kocok mentega dan gula:

Gunakan mixer atau whisk untuk mengocok mentega dan gula palem hingga lembut dan mengembang.

Tambahkan bahan basah:

Masukkan madu/molase dan telur, lalu aduk rata.

Campurkan bahan kering ke bahan basah:

Masukkan campuran tepung sedikit demi sedikit sambil diaduk hingga menjadi adonan yang bisa dipulung.

Dinginkan adonan:

Bungkus adonan dengan plastik wrap dan simpan di kulkas selama 1 jam agar lebih mudah dibentuk.

Cetak dan panggang:

Panaskan oven ke suhu 175°C.

Gilas adonan dengan ketebalan sekitar 5 mm, lalu cetak sesuai selera (misalnya bentuk manusia roti jahe).

Susun di atas loyang yang sudah dialasi kertas baking.

Panggang hingga matang:

Panggang selama 8-12 menit, tergantung ketebalan adonan dan ukuran cetakan.

Biarkan dingin sebelum dihias.

Hias sesuai selera (opsional):

Gunakan royal icing (campuran putih telur dan gula halus) atau cokelat leleh untuk dekorasi.

Roti jahe ini cocok untuk camilan atau hadiah spesial, terutama saat musim liburan! Selamat mencoba!