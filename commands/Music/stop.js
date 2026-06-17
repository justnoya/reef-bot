'use strict';

module.exports = {
  name: 'stop',
  description: 'Stop music and disconnect from voice channel',
  category: 'music',
  aliases: ['disconnect', 'fuckoff'],
  cooldown: 2,

  run: async (client, message) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player) return message.reply({ content: '❌ Nothing is playing right now!' });

    await player.stopPlaying(true, true);
    message.react('⏹').catch(() => {});
  },
};
