module.exports = {
  name: 'shuffle',
  description: 'Shuffle the music queue',
  category: 'music',
  aliases: ['mix'],
  cooldown: 3,

  run: async (client, message) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue || queue.songs.length < 2) {
      return message.reply({ content: '❌ Need at least 2 songs in the queue to shuffle!' });
    }

    await client.distube.shuffle(message.guild.id);
    message.react('🔀').catch(() => {});
  },
};
