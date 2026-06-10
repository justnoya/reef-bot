const { EmbedBuilder, MessageFlags } = require('discord.js');
const musicManager = require('../../util/MusicManager');
const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('../../util/musicPlayerUI');

module.exports = {
  name: 'play',
  description: 'Play a song from YouTube',
  category: 'music',
  aliases: ['p'],
  cooldown: 3,
  args: true,

  run: async (client, message, args) => {
    const query = args.join(' ');
    if (!query) {
      return message.reply({ content: '❌ Please provide a song name or URL.' });
    }

    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return message.reply({ content: '❌ You need to be in a voice channel to play music!' });
    }

    const botMember = message.guild.members.cache.get(client.user.id);
    if (!voiceChannel.permissionsFor(botMember).has(['Connect', 'Speak'])) {
      return message.reply({ content: '❌ I need **Connect** and **Speak** permissions in your voice channel!' });
    }

    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? parseInt(message.guild.members.me.displayHexColor.replace('#', ''), 16)
      : 0x2f3136;

    const loadingMsg = await message.reply({ content: '🔍 Searching...' });

    try {
      const results = await musicManager.search(query, 1);
      if (!results.length) {
        return loadingMsg.edit({ content: '❌ No results found for that search.' });
      }

      const track = results[0];
      let q = musicManager.getQueue(message.guild.id);

      if (!q || !q.connection) {
        q = await musicManager.join(voiceChannel, message.guild.voiceAdapterCreator, message.guild.id);
      }

      q.tracks.push(track);

      if (!q.playing) {
        q.currentIndex = q.tracks.length - 1;
        await musicManager.playTrack(q, track, async (queue) => {
          if (q.playerMessage) {
            q.playerMessage.edit({ content: '⏹ Queue finished.' }).catch(() => {});
          }
        });
      }

      const container = buildPlayerContainer(track, accent, false);

      await loadingMsg.delete().catch(() => {});
      const sent = await message.channel.send({
        flags: IS_COMPONENTS_V2,
        components: [container],
      });

      q.playerMessage = sent;

    } catch (err) {
      console.error('[Music Play]', err);
      loadingMsg.edit({ content: `❌ An error occurred: ${err.message}` }).catch(() => {});
    }
  },
};
