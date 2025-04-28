// filepath: d:\bot-gajelas\handlers\commandLoader.js
const fs = require("fs");
const path = require("path");

function getAllCommandFiles(dir, files = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllCommandFiles(fullPath, files);
    } else if (file.endsWith(".js")) {
      files.push(fullPath);
    }
  });
  return files;
}

module.exports = {
  loadCommands: (client) => {
    const commands = [];
    const commandFiles = getAllCommandFiles(
      path.join(__dirname, "../commands")
    );

    for (const file of commandFiles) {
      const command = require(file);
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    }

    console.log("Commands berhasil dimuat dan didaftarkan.");
  },
};