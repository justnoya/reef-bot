module.exports = {
  name: "su",
  aliases: [],
  owner: true,
  description: "Speak as the bot. !su <message> | !su stop",

  run: async (client, message, args) => {
    if (!client.config.owner.includes(message.author.id)) return;

    if (!client.suSessions) client.suSessions = new Map();

    if (args[0] && args[0].toLowerCase() === "stop") {
      if (client.suSessions.has(message.author.id)) {
        client.suSessions.delete(message.author.id);
        await message.delete().catch(() => {});
      }
      return;
    }

    const text = args.join(" ");
    if (!text) return;

    await message.delete().catch(() => {});
    await message.channel.send(text).catch(() => {});

    client.suSessions.set(message.author.id, message.channel.id);
  },
};
