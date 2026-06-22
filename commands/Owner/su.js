module.exports = {
  name: "su",
  aliases: [],
  owner: true,
  description: "Toggle bot-speak mode. !su = on | !su stop = off",

  run: async (client, message, args) => {
    if (!client.config.owner.includes(message.author.id)) return;

    if (!client.suSessions) client.suSessions = new Map();

    if (args[0] && args[0].toLowerCase() === "stop") {
      client.suSessions.delete(message.author.id);
      await message.delete().catch(() => {});
      return;
    }

    client.suSessions.set(message.author.id, message.channel.id);
    await message.delete().catch(() => {});
  },
};
