const { ApplicationCommandOptionType } = require('discord.js');
const musicManager = require('../../util/MusicManager');
const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('../../util/musicPlayerUI');

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
      autocomplete: true,
    },
  ],

  // ── Autocomplete: fires while the user is typing ───────────────────────────
  autocomplete: async (client, interaction) => {
    const focused = interaction.options.getFocused();
    if (!focused || focused.length < 2) {
      return interaction.respond([]).catch(() => {});
    }

    try {
      const results = await musicManager.search(focused, 8);
      const choices = results.map(r => ({
        name:  `${r.title} — ${r.channel} (${r.duration})`.slice(0, 100),
        value: r.url,
      }));
      await interaction.respond(choices).catch(() => {});
    } catch {
      await interaction.respond([]).catch(() => {});
    }
  },

  // ── Run: fires when the user submits the command ───────────────────────────
  run: async (client, interaction) => {
    // The autocomplete value is now a YouTube URL (or raw query as fallback)
    const query = interaction.options.getString('search');

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Join a voice channel first!', flags: 64 });
    }

    const botMember = interaction.guild.members.me;
    if (!voiceChannel.permissionsFor(botMember).has(['Connect', 'Speak'])) {
      return interaction.reply({ content: '❌ I need **Connect** and **Speak** permissions in your voice channel!', flags: 64 });
    }

    const accent = botMember.displayHexColor !== '#000000'
      ? parseInt(botMember.displayHexColor.replace('#', ''), 16)
      : 0x2f3136;

    await interaction.deferReply();

    try {
      // Search or resolve the direct URL picked from autocomplete
      let results;
      if (query.startsWith('http')) {
        // User picked an autocomplete result — treat as direct URL
        const info = await require('play-dl').video_info(query).catch(() => null);
        if (info) {
          results = [{
            title:     info.video_details.title || 'Unknown',
            url:       query,
            duration:  info.video_details.durationRaw || '0:00',
            thumbnail: info.video_details.thumbnails?.[0]?.url || '',
            channel:   info.video_details.channel?.name || 'Unknown Artist',
          }];
        } else {
          results = await musicManager.search(query, 5);
        }
      } else {
        results = await musicManager.search(query, 5);
      }

      if (!results?.length) {
        return interaction.editReply({ content: '❌ No results found.' });
      }

      const track = results[0];

      // Join voice channel
      let q = musicManager.getQueue(interaction.guild.id);
      if (!q?.connection) {
        q = await musicManager.join(voiceChannel, interaction.guild.voiceAdapterCreator, interaction.guild.id);
      }

      // Add to queue
      q.tracks.push(track);

      // Build and send the player UI
      const playerContainer = buildPlayerContainer(track, accent, false);
      await interaction.editReply({
        flags: IS_COMPONENTS_V2,
        components: [playerContainer],
      });

      // Start playback if nothing is playing
      if (!q.playing) {
        q.currentIndex = q.tracks.length - 1;
        await musicManager.playTrack(q, track, async () => {
          interaction.fetchReply()
            .then(msg => msg.edit({ content: '⏹ Queue finished.', components: [] }))
            .catch(() => {});
        });
      }

      const reply = await interaction.fetchReply().catch(() => null);
      if (reply) q.playerMessage = reply;

    } catch (err) {
      console.error('[Slash Play]', err);
      interaction.editReply({ content: `❌ ${err.message}` }).catch(() => {});
    }
  },
};
