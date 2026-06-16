module.exports.run = (client, message) => {
  if (message.partial || message.author?.bot) return;
  if (!message.guild) return;

  if (!client.snipes) client.snipes = new Map();

  client.snipes.set(message.channel.id, {
    content:   message.content || '',
    authorId:  message.author.id,
    avatarURL: message.author.displayAvatarURL({ size: 256 }),
    time:      Date.now(),
  });

  setTimeout(() => {
    const current = client.snipes.get(message.channel.id);
    if (current && current.time === client.snipes.get(message.channel.id)?.time) {
      client.snipes.delete(message.channel.id);
    }
  }, 5 * 60 * 1000);
};
