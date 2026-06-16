module.exports = {
  name: 'stop',
  description: 'Stop music and disconnect from voice channel',
  category: 'music',
  aliases: ['disconnect', 'fuckoff'],
  cooldown: 2,

  run: async (client, message) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue) return message.reply({ content: '❌ Nothing is playing right now!' });

    await client.distube.stop(message.guild.id);
    message.react('⏹').catch(() => {});
  },
};
