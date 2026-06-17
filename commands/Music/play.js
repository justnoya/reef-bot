'use strict';

module.exports = {
  name: 'play',
  description: 'Play a song in your voice channel',
  category: 'music',
  aliases: ['p'],
  cooldown: 3,
  args: true,

  run: async (client, message, args) => {
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel)
      return message.reply({ content: '❌ You need to be in a voice channel!' });

    const perms = voiceChannel.permissionsFor(message.guild.members.me);
    if (!perms?.has(['Connect', 'Speak']))
      return message.reply({ content: '❌ I need **Connect** and **Speak** permissions!' });

    if (!client.lavalink)
      return message.reply({ content: '❌ Music system is not ready yet — Lavalink node offline.' });

    const query = args.join(' ');

    try {
      let player = client.lavalink.getPlayer(message.guild.id);
      if (!player) {
        player = client.lavalink.createPlayer({
          guildId: message.guild.id,
          voiceChannelId: voiceChannel.id,
          textChannelId: message.channel.id,
          selfDeaf: true,
          volume: 80,
        });
      }

      if (!player.connected) await player.connect();

      const res = await player.search({ query }, message.author);
      if (!res?.tracks?.length)
        return message.reply({ content: '❌ No results found.' });

      if (res.loadType === 'playlist') {
        await player.queue.add(res.tracks);
        message.reply({ content: `➕ Playlist **${res.playlist?.name}** · \`${res.tracks.length} tracks\` added.` });
      } else {
        await player.queue.add(res.tracks[0]);
        if (res.tracks[0] !== player.queue.current) {
          message.reply({ content: `➕ **${res.tracks[0].info.title}** added to queue.` });
        }
      }

      if (!player.playing && !player.paused) await player.play();
    } catch (err) {
      console.error('[Music Play]', err.message);
      message.reply({ content: `❌ ${err.message}` }).catch(() => {});
    }
  },
};
