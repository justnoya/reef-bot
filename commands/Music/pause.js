'use strict';

module.exports = {
  name: 'pause',
  description: 'Pause or resume the current song',
  category: 'music',
  aliases: ['pa', 'resume', 'rs'],
  cooldown: 2,

  run: async (client, message) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player?.playing && !player?.paused)
      return message.reply({ content: '❌ Nothing is playing right now!' });

    if (player.paused) {
      await player.resume();
      message.react('▶').catch(() => {});
    } else {
      await player.pause();
      message.react('⏸').catch(() => {});
    }
  },
};
