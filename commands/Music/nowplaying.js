'use strict';

const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('../../util/musicPlayerUI');

module.exports = {
  name: 'nowplaying',
  description: 'Show the currently playing song',
  category: 'music',
  aliases: ['now', 'song'],
  cooldown: 3,

  run: async (client, message) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player?.queue?.current)
      return message.reply({ content: '❌ Nothing is playing right now!' });

    const container = buildPlayerContainer(player.queue.current, 0xFFFFFF, player.paused);
    message.reply({ flags: IS_COMPONENTS_V2, components: [container] });
  },
};
