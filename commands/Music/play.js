module.exports = {
  name: 'play',
  description: 'Play a song or YouTube playlist in your voice channel',
  category: 'music',
  aliases: ['p'],
  cooldown: 3,
  args: true,

  run: async (client, message, args) => {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply({ content: '❌ You need to be in a voice channel to play music!' });
    }

    const perms = voiceChannel.permissionsFor(message.guild.members.me);
    if (!perms?.has(['Connect', 'Speak'])) {
      return message.reply({ content: '❌ I need **Connect** and **Speak** permissions in your voice channel!' });
    }

    const query = args.join(' ');
    try {
      await client.distube.play(voiceChannel, query, {
        message,
        textChannel: message.channel,
        member: message.member,
      });
    } catch (err) {
      console.error('[Music Play]', err.message);
      message.reply({ content: `❌ ${err.message}` }).catch(() => {});
    }
  },
};
