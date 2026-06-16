module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  category: 'music',
  aliases: ['sk'],
  cooldown: 2,

  run: async (client, message) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue) return message.reply({ content: '❌ Nothing is playing right now!' });

    try {
      await client.distube.skip(message.guild.id);
      message.react('⏭').catch(() => {});
    } catch (err) {
      message.reply({ content: `❌ No next song in queue.` });
    }
  },
};
