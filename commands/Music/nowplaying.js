const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('../../util/musicPlayerUI');

module.exports = {
  name: 'nowplaying',
  description: 'Show the currently playing song',
  category: 'music',
  aliases: ['now', 'song'],
  cooldown: 3,

  run: async (client, message) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue || !queue.songs.length) {
      return message.reply({ content: '❌ Nothing is playing right now!' });
    }

    const container = buildPlayerContainer(queue.songs[0], 0xFFFFFF, queue.paused);
    message.reply({ flags: IS_COMPONENTS_V2, components: [container] });
  },
};
