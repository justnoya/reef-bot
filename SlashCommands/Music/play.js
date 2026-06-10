const { ApplicationCommandOptionType, MessageFlags } = require('discord.js');
const musicManager = require('../../util/MusicManager');
const { buildPlayerContainer, buildSearchResultsContainer, IS_COMPONENTS_V2 } = require('../../util/musicPlayerUI');

module.exports = {
  name: 'play',
  description: 'Search and play a song from YouTube',
  cooldown: 3,
  options: [
    {
      name: 'search',
      description: 'Song name or YouTube URL',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client, interaction) => {
    const query = interaction.options.getString('search');

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ You need to be in a voice channel to play music!', ephemeral: true });
    }

    const botMember = interaction.guild.members.cache.get(client.user.id);
    if (!voiceChannel.permissionsFor(botMember).has(['Connect', 'Speak'])) {
      return interaction.reply({ content: '❌ I need **Connect** and **Speak** permissions in your voice channel!', ephemeral: true });
    }

    const accent = interaction.guild.members.me.displayHexColor !== '#000000'
      ? parseInt(interaction.guild.members.me.displayHexColor.replace('#', ''), 16)
      : 0x2f3136;

    await interaction.deferReply();

    try {
      const results = await musicManager.search(query, 5);
      if (!results.length) {
        return interaction.editReply({ content: '❌ No results found for that search.' });
      }

      client._musicSearchCache = client._musicSearchCache || new Map();
      client._musicSearchCache.set(interaction.user.id, { results, voiceChannel, guildId: interaction.guild.id });

      setTimeout(() => client._musicSearchCache?.delete(interaction.user.id), 120_000);

      const searchContainer = buildSearchResultsContainer(query, results, accent);
      const playerContainer = buildPlayerContainer(results[0], accent, false);

      await interaction.editReply({
        flags: IS_COMPONENTS_V2,
        components: [searchContainer, playerContainer],
      });

      let q = musicManager.getQueue(interaction.guild.id);
      if (!q || !q.connection) {
        q = await musicManager.join(voiceChannel, interaction.guild.voiceAdapterCreator, interaction.guild.id);
      }

      const track = results[0];
      q.tracks.push(track);

      if (!q.playing) {
        q.currentIndex = q.tracks.length - 1;
        await musicManager.playTrack(q, track, async () => {
          const msg = await interaction.fetchReply().catch(() => null);
          if (msg) msg.edit({ content: '⏹ Queue finished.' }).catch(() => {});
        });
      }

      const reply = await interaction.fetchReply().catch(() => null);
      if (reply) q.playerMessage = reply;

    } catch (err) {
      console.error('[Slash Play]', err);
      interaction.editReply({ content: `❌ An error occurred: ${err.message}` }).catch(() => {});
    }
  },
};
