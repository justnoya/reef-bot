'use strict';

module.exports = {
  name: 'shuffle',
  description: 'Shuffle the music queue',
  category: 'music',
  aliases: ['mix'],
  cooldown: 3,

  run: async (client, message) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player || !player.queue.tracks.length)
      return message.reply({ content: '❌ Need songs in the queue to shuffle!' });

    await player.queue.utils.shuffle();
    message.react('🔀').catch(() => {});
  },
};
