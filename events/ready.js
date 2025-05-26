module.exports = {
  once: true,
  async execute(client) {
    console.log(`Bot siap! Login sebagai ${client.user.tag}`);
  },
};
