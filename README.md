```markdown
# 🚀 Cara Menggunakan Bot Serbaguna Ini 🚀

Selamat datang di panduan penggunaan bot Discord multifungsi kami! Bot ini siap membantu Anda dengan berbagai fitur keren. Ikuti langkah-langkah ini untuk memulai:

## 📋 Prasyarat

Pastikan Anda memiliki perangkat lunak berikut terinstal:

* **Node.js:** (Versi 18 atau lebih baru direkomendasikan)
* **npm** atau **yarn:** Manajer paket Node.js

## ⚙️ Instalasi

1.  **Clone Repositori:** Dapatkan kode bot ke komputer Anda.
    ```bash
    git clone <URL_REPOSITORI_ANDA>
    cd bot-gajelas
    ```
2.  **Instal Dependensi:** Pasang semua paket yang dibutuhkan bot.
    ```bash
    npm install
    # atau jika menggunakan yarn
    # yarn install
    ```

## 🔑 Konfigurasi Penting (`.env`)

Buat file bernama `.env` di direktori utama proyek dan isi dengan variabel lingkungan yang diperlukan. Ini adalah kunci agar bot berfungsi dengan baik!

```dotenv
# --- Kredensial Utama ---
DISCORD_TOKEN=TOKEN_BOT_DISCORD_ANDA
CLIENT_ID=ID_APLIKASI_BOT_ANDA

# --- API Keys (Penting untuk Fitur AI & Downloader) ---
# Gemini (Diperlukan minimal 1, bisa sampai 4 untuk failover)
GEMINI_API_KEY_1=KUNCI_API_GEMINI_ANDA_1
GEMINI_API_KEY_2=KUNCI_API_GEMINI_ANDA_2 # Opsional
GEMINI_API_KEY_3=KUNCI_API_GEMINI_ANDA_3 # Opsional
GEMINI_API_KEY_4=KUNCI_API_GEMINI_ANDA_4 # Opsional

# Together AI (Untuk Llama & DeepSeek)
TOGETHER_API_KEY=KUNCI_API_TOGETHER_AI_ANDA

# EmbedEZ (Untuk embed otomatis)
EMBED_EZ_API_KEY=KUNCI_API_EMBEDEZ_ANDA

# --- ID Channel & Role (Sesuaikan dengan server Anda) ---
# Logging
LOG_CHANNEL_ID=ID_CHANNEL_LOG_UTAMA_ANDA
DEV_LOG_CHANNEL_ID=ID_CHANNEL_LOG_DEVELOPER_ANDA # Untuk log restart, set status, dll.

# Role & Fitur Spesifik
MUTED_ROLE_ID=ID_ROLE_MUTE_ANDA
QUOTE_CHANNEL_ID=ID_CHANNEL_QUOTE_ANDA
QOTD_TIME=01:00 # Waktu UTC untuk mengirim Quote of the Day (Format HH:mm)

# ID Developer (Pisahkan dengan koma jika lebih dari satu)
DEV_ID=ID_DEVELOPER_1,ID_DEVELOPER_2

# ID Guild (Server) tempat bot aktif (Pisahkan dengan koma jika lebih dari satu)
GUILD_ID=ID_SERVER_ANDA_1,ID_SERVER_ANDA_2
```

**Penting:** Jangan pernah membagikan file `.env` atau token bot Anda kepada siapa pun!

## ▶️ Menjalankan Bot

Setelah konfigurasi selesai, jalankan bot dengan perintah:

```bash
npm start
# atau
node index.js
```

Bot akan online dan siap menerima perintah!

## ✨ Fitur & Perintah Utama

Bot ini dilengkapi dengan berbagai perintah, baik melalui *prefix* maupun *slash command* (`/`).

### 📥 Downloader Media (Prefix Command)

Gunakan prefix `f.` diikuti dengan URL untuk mengunduh media:

* `f.ig <URL Instagram Reel>`: Unduh video dari Instagram Reels.
* `f.fb <URL Video Facebook>`: Unduh video dari Facebook.
* `f.tt <URL Video TikTok>`: Unduh video dari TikTok.
* `f.yt <URL Video YouTube>`: Unduh video dari YouTube (kualitas 480p).
* `f.x <URL Video Twitter/X>`: Unduh video dari Twitter/X.

*Contoh:* `f.ig https://www.instagram.com/reel/contoh123/`

### 🧠 Fitur AI (Prefix & Slash Command)

Berinteraksi dengan model AI canggih:

* **Prefix Command:**
    * `f.geminipro <pertanyaan>`: Tanya Gemini Pro (Eksperimental).
    * `f.geminiflash <pertanyaan>`: Tanya Gemini Flash (Eksperimental).
    * `f.llama <pertanyaan>`: Tanya Llama 4 Maverick.
    * `f.deepseek-r1 <pertanyaan>`: Tanya DeepSeek R1.
    * *(Anda juga bisa melampirkan file (txt, pdf, docx, xlsx, pptx, gambar) saat menggunakan perintah ini!)*
* **Slash Command:**
    * `/aichat [initial_prompt] [file]`: Memulai sesi chat interaktif dengan Gemini 2.5 Flash di dalam *thread* forum. Lampirkan file jika perlu.
    * `/aichat_end`: Mengakhiri sesi `/aichat` yang sedang aktif di *thread*.

### 🔗 Embed Otomatis

Bot secara otomatis mendeteksi link dari:

* Instagram
* TikTok
* X (Twitter)
* Reddit
* iFunny

dan mengubahnya menjadi embed yang lebih menarik menggunakan layanan EmbedEZ. Fitur ini dapat diaktifkan/dinonaktifkan oleh developer menggunakan `/toggleembed`.

### 🛠️ Utilitas (Slash Command)

Perintah bantu sehari-hari:

* `/help`: Menampilkan daftar semua *slash command* yang tersedia.
* `/info`: Menampilkan informasi tentang bot ini.
* `/ping`: Mengecek latensi bot dan API Discord.
* `/avatar [user] [type]`: Melihat avatar global atau server pengguna.
* `/banner [user] [type]`: Melihat banner global atau server pengguna.
* `/userinfo [user]`: Menampilkan informasi detail tentang pengguna Discord.
* `/serverinfo`: Menampilkan informasi detail tentang server saat ini.
* `/list-roles`: Menampilkan daftar semua role di server.
* `/adzan [city]`: Menampilkan jadwal sholat untuk kota tertentu di Indonesia.

### 🛡️ Moderasi (Slash Command)

Perintah untuk menjaga ketertiban server (membutuhkan izin):

* `/ban <user> [waktu] [alasan]`: Melarang pengguna masuk server (bisa temporer).
* `/unban <user_id>`: Mencabut larangan pengguna berdasarkan ID.
* `/kick <user> [alasan]`: Mengeluarkan pengguna dari server.
* `/mute <user> [waktu] [alasan]`: Mencegah pengguna mengirim pesan (temporer atau permanen).
* `/unmute <user>`: Mencabut status mute pengguna.
* `/timeout <user> <duration> [reason]`: Memberikan timeout (tidak bisa berinteraksi) kepada pengguna untuk durasi tertentu.
* `/untimeout <user>`: Mencabut status timeout pengguna.
* `/clean-message <amount>`: Menghapus sejumlah pesan terakhir di channel (membutuhkan izin Administrator).

### 🔒 Perintah Developer (Slash Command)

Hanya untuk pengguna dengan ID yang terdaftar di `.env`:

* `/restart`: Merestart bot.
* `/say <message> [reply_to]`: Mengirim pesan sebagai bot, bisa membalas pesan lain.
* `/set status <type> <message> <duration>`: Mengatur status online bot (Online, Idle, DND, Invisible) dan pesan custom.
* `/set activity <type> <message> <duration>`: Mengatur aktivitas bot (Playing, Listening, Watching, Streaming).
* `/toggleembed <opsi>`: Mengaktifkan atau menonaktifkan sistem deteksi embed otomatis.

---

Selamat menggunakan bot ini! Jika Anda menemukan bug atau memiliki saran, jangan ragu untuk memberitahu pengembang. 🎉
```

Bagian ini mencakup:
* Langkah instalasi yang jelas.
* Penjelasan detail tentang konfigurasi `.env` yang diperlukan.
* Cara menjalankan bot.
* Ringkasan fitur utama yang dikategorikan (Downloader, AI, Embed, Utilitas, Moderasi, Developer).
* Contoh penggunaan untuk perintah prefix.
* Penggunaan markdown dan emoji untuk membuatnya lebih menarik secara visual.
