'use strict';

module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  category: 'music',
  aliases: ['sk'],
  cooldown: 2,

  run: async (client, message) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player?.playing) return message.reply({ content: '❌ Nothing is playing right now!' });

    try {
      await player.skip();
      message.react('⏭').catch(() => {});
    } catch {
      message.reply({ content: '❌ No next song in queue.' });
    }
  },
};
