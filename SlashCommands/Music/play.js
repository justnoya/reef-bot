'use strict';

const { ApplicationCommandOptionType } = require('discord.js');
const { buildPlayerContainer, IS_COMPONENTS_V2 } = require('../../util/musicPlayerUI');

module.exports = {
  name: 'play',
  description: 'Search and play a song',
  cooldown: 3,
  options: [{
    name: 'search',
    description: 'Song name or URL',
    type: ApplicationCommandOptionType.String,
    required: true,
    autocomplete: true,
  }],

  autocomplete: async (client, interaction) => {
    const focused = interaction.options.getFocused();
    if (!focused || focused.length < 2) return interaction.respond([]).catch(() => {});
    if (!client.lavalink) return interaction.respond([]).catch(() => {});

    try {
      const tempPlayer = client.lavalink.getPlayer(interaction.guild.id)
        || client.lavalink.createPlayer({ guildId: interaction.guild.id, voiceChannelId: interaction.member?.voice?.channel?.id || '0', textChannelId: interaction.channel.id, selfDeaf: true });

      const res = await tempPlayer.search({ query: focused, source: 'ytsearch' }, interaction.user);
      const choices = (res?.tracks || []).slice(0, 8).map(t => ({
        name: `${t.info.title} — ${t.info.author} (${t.info.isStream ? 'LIVE' : require('../../../util/musicPlayerUI').formatMs(t.info.duration)})`.slice(0, 100),
        value: t.info.uri,
      }));
      await interaction.respond(choices).catch(() => {});
    } catch {
      await interaction.respond([]).catch(() => {});
    }
  },

  run: async (client, interaction) => {
    const query = interaction.options.getString('search');

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel)
      return interaction.reply({ content: '❌ Join a voice channel first!', flags: 64 });

    if (!client.lavalink)
      return interaction.reply({ content: '❌ Music system offline — Lavalink node not connected.', flags: 64 });

    const botMember = interaction.guild.members.me;
    if (!voiceChannel.permissionsFor(botMember).has(['Connect', 'Speak']))
      return interaction.reply({ content: '❌ I need **Connect** and **Speak** permissions!', flags: 64 });

    const accent = botMember.displayHexColor !== '#000000'
      ? parseInt(botMember.displayHexColor.replace('#', ''), 16)
      : 0x2f3136;

    await interaction.deferReply();

    try {
      let player = client.lavalink.getPlayer(interaction.guild.id);
      if (!player) {
        player = client.lavalink.createPlayer({
          guildId: interaction.guild.id,
          voiceChannelId: voiceChannel.id,
          textChannelId: interaction.channel.id,
          selfDeaf: true,
          volume: 80,
        });
      }

      if (!player.connected) await player.connect();

      const res = await player.search({ query }, interaction.user);
      if (!res?.tracks?.length)
        return interaction.editReply({ content: '❌ No results found.' });

      const track = res.tracks[0];
      await player.queue.add(track);

      const container = buildPlayerContainer(track, accent, false);
      await interaction.editReply({ flags: IS_COMPONENTS_V2, components: [container] });

      if (!player.playing && !player.paused) await player.play();
    } catch (err) {
      console.error('[Slash Play]', err.message);
      interaction.editReply({ content: `❌ ${err.message}` }).catch(() => {});
    }
  },
};
