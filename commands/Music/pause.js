module.exports = {
  name: 'pause',
  description: 'Pause or resume the current song',
  category: 'music',
  aliases: ['pa', 'resume', 'rs'],
  cooldown: 2,

  run: async (client, message) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue) return message.reply({ content: '❌ Nothing is playing right now!' });

    if (queue.paused) {
      client.distube.resume(message.guild.id);
      message.react('▶').catch(() => {});
    } else {
      client.distube.pause(message.guild.id);
      message.react('⏸').catch(() => {});
    }
  },
};
