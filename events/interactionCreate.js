const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const { buildCategoryContainer, buildMainContainer, IS_COMPONENTS_V2 } = require('../util/helpBuilder');
const { buildPlayerContainer, buildSearchResultsContainer } = require('../util/musicPlayerUI');
const musicManager = require('../util/MusicManager');

const User  = require("../Models/User");
const { slash } = require(`${process.cwd()}/util/onCoolDown.js`);

module.exports.run = async (client, interaction) => {
  // ── Autocomplete ─────────────────────────────────────────────────────────────
  if (interaction.isAutocomplete()) {
    const command = client.slash.get(interaction.commandName);
    if (command?.autocomplete) {
      try { await command.autocomplete(client, interaction); } catch { interaction.respond([]).catch(() => {}); }
    }
    return;
  }

  let prefix = await client.db.get(`prefix_${interaction.guild?.id}`);
  if (prefix === null) prefix = client.prefix;

  const accent = interaction.guild?.members?.me?.displayHexColor !== '#000000'
    ? interaction.guild?.members?.me?.displayHexColor
    : client.config.embedColor;

  const accentInt = accent ? parseInt(accent.replace('#', ''), 16) : 0x2f3136;

  // ── Help: select menu ────────────────────────────────────────────────────────
  if (interaction.isStringSelectMenu?.() || interaction.isSelectMenu?.()) {
    const customId = interaction.customId;

    // ── Music: search result picker ─────────────────────────────────────────
    if (customId === 'music_select_result') {
      const cache = client._musicSearchCache?.get(interaction.user.id);
      if (!cache) {
        return interaction.reply({ content: '❌ Search session expired. Run `/play` again.', ephemeral: true });
      }

      const idx = parseInt(interaction.values[0].replace('result_', ''), 10);
      const track = cache.results[idx];
      if (!track) return interaction.reply({ content: '❌ Invalid selection.', ephemeral: true });

      const voiceChannel = interaction.member?.voice?.channel;
      if (!voiceChannel) {
        return interaction.reply({ content: '❌ Join a voice channel first!', ephemeral: true });
      }

      await interaction.deferUpdate();

      try {
        let q = musicManager.getQueue(interaction.guild.id);
        if (!q || !q.connection) {
          q = await musicManager.join(voiceChannel, interaction.guild.voiceAdapterCreator, interaction.guild.id);
        }

        q.tracks = [track];
        q.currentIndex = 0;

        if (q.player) q.player.stop(true);

        await musicManager.playTrack(q, track, async () => {});

        const playerContainer = buildPlayerContainer(track, accentInt, false);
        await interaction.editReply({
          flags: require('../util/musicPlayerUI').IS_COMPONENTS_V2,
          components: [playerContainer],
        }).catch(() => {});

        client._musicSearchCache?.delete(interaction.user.id);
      } catch (err) {
        console.error('[Music select]', err);
        interaction.followUp({ content: `❌ Error: ${err.message}`, ephemeral: true }).catch(() => {});
      }
      return;
    }

    // ── Music: player options select ─────────────────────────────────────────
    if (customId === 'music_options') {
      const value = interaction.values[0];
      const q = musicManager.getQueue(interaction.guild.id);

      await interaction.deferUpdate();

      if (value === 'stop') {
        musicManager.stop(interaction.guild.id);
        return interaction.editReply({ content: '⏹ Stopped and disconnected.', components: [], flags: 0 }).catch(() => {});
      }

      if (!q) {
        return interaction.followUp({ content: '❌ Nothing is playing right now.', ephemeral: true }).catch(() => {});
      }

      let reply = '';
      if (value === 'autoplay')       { q.autoplay   = !q.autoplay;   reply = `🔄 Autoplay **${q.autoplay ? 'ON' : 'OFF'}**`; }
      if (value === 'loop_queue')     { q.loopQueue  = !q.loopQueue;  reply = `🔁 Loop Queue **${q.loopQueue ? 'ON' : 'OFF'}**`; }
      if (value === 'loop_song')      { q.loopSong   = !q.loopSong;   reply = `🔂 Loop Song **${q.loopSong ? 'ON' : 'OFF'}**`; }
      if (value === 'smart_shuffle')  { q.tracks.sort(() => Math.random() - 0.5); reply = '🔀 Queue shuffled!'; }
      if (value === 'reconnect') {
        const vc = interaction.member?.voice?.channel;
        if (vc) { musicManager.reconnect(q, vc); reply = '🔌 Reconnected!'; }
        else reply = '❌ Join a voice channel first.';
      }
      if (value === 'radio')   { reply = '📻 Radio mode coming soon!'; }
      if (value === 'lyrics')  { reply = '📜 Lyrics feature coming soon!'; }
      if (value === 'add_songs') { reply = '➕ Use `/play <song>` to add more songs to the queue!'; }

      if (reply) {
        interaction.followUp({ content: reply, ephemeral: true }).catch(() => {});
      }

      if (q?.current) {
        const updatedContainer = buildPlayerContainer(q.current, accentInt, q.paused);
        interaction.editReply({
          flags: require('../util/musicPlayerUI').IS_COMPONENTS_V2,
          components: [updatedContainer],
        }).catch(() => {});
      }
      return;
    }

    // ── Help select menu ─────────────────────────────────────────────────────
    if (customId === 'helpop') {
      const value = interaction.values[0];

      if (value === 'home') {
        const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
        const supportURL = client.config.links.dc;
        const container  = buildMainContainer(client, prefix, accent, inviteURL, supportURL);
        return interaction.update({
          components: [container.toJSON()],
          flags: IS_COMPONENTS_V2,
        }).catch(() => {});
      }

      const container = buildCategoryContainer(client, value, 0, prefix, accent);
      if (container) {
        return interaction.update({
          components: [container.toJSON()],
          flags: IS_COMPONENTS_V2,
        }).catch(() => {});
      }
    }
    return;
  }

  // ── Buttons ──────────────────────────────────────────────────────────────────
  if (interaction.isButton()) {
    const customId = interaction.customId;

    // ── Music buttons ────────────────────────────────────────────────────────
    if (customId.startsWith('music_')) {
      const q = musicManager.getQueue(interaction.guild.id);

      if (customId === 'music_playlists') {
        return interaction.reply({ content: '🎵 Playlist feature coming soon!', ephemeral: true });
      }
      if (customId === 'music_browse') {
        return interaction.reply({ content: '🔍 Browse feature coming soon!', ephemeral: true });
      }
      if (customId === 'music_settings') {
        return interaction.reply({ content: '⚙️ Settings feature coming soon!', ephemeral: true });
      }

      if (!q || !q.current) {
        return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
      }

      await interaction.deferUpdate();

      if (customId === 'music_prev') {
        const ok = musicManager.prev(interaction.guild.id);
        if (!ok) {
          interaction.followUp({ content: '⏮ No previous song in queue.', ephemeral: true }).catch(() => {});
        }
      }

      if (customId === 'music_pause') {
        const nowPaused = musicManager.pause(interaction.guild.id);
        const updatedContainer = buildPlayerContainer(q.current, accentInt, nowPaused);
        return interaction.editReply({
          flags: require('../util/musicPlayerUI').IS_COMPONENTS_V2,
          components: [updatedContainer],
        }).catch(() => {});
      }

      if (customId === 'music_skip') {
        musicManager.skip(interaction.guild.id);
        interaction.followUp({ content: '⏭ Skipped!', ephemeral: true }).catch(() => {});
      }

      if (customId === 'music_stop') {
        musicManager.stop(interaction.guild.id);
        return interaction.editReply({ content: '⏹ Stopped and disconnected.', components: [], flags: 0 }).catch(() => {});
      }

      if (q?.current && customId !== 'music_stop') {
        const updatedContainer = buildPlayerContainer(q.current, accentInt, q.paused);
        interaction.editReply({
          flags: require('../util/musicPlayerUI').IS_COMPONENTS_V2,
          components: [updatedContainer],
        }).catch(() => {});
      }
      return;
    }

    // ── Help: Back button ────────────────────────────────────────────────────
    if (customId === 'helpback') {
      const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
      const supportURL = client.config.links.dc;
      const container  = buildMainContainer(client, prefix, accent, inviteURL, supportURL);
      return interaction.update({
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2,
      }).catch(() => {});
    }

    // ── Help: Prev/Next pages ─────────────────────────────────────────────────
    if (customId.startsWith('helpcat_')) {
      const parts    = customId.split('_');
      const category = parts[1];
      const page     = parseInt(parts[2], 10) || 0;
      const container = buildCategoryContainer(client, category, page, prefix, accent);
      if (container) {
        return interaction.update({
          components: [container.toJSON()],
          flags: IS_COMPONENTS_V2,
        }).catch(() => {});
      }
    }

    // ── Help: no-op disabled buttons ──────────────────────────────────────────
    if (customId.startsWith('help_noop')) {
      return interaction.deferUpdate().catch(() => {});
    }

    // ── Delete button ─────────────────────────────────────────────────────────
    if (customId === 'DELETE_BUT') {
      const em = new EmbedBuilder().setDescription('Only Bot Owner Can Use This Button').setColor('#ff0000');
      if (client.config.owner.includes(interaction.member?.user?.id))
        return interaction.message.delete();
      else
        return interaction.reply({ embeds: [em], ephemeral: true });
    }
  }

  // ── Slash commands ───────────────────────────────────────────────────────────
  if (interaction.isCommand()) {
    let user = await User.findOne({ userId: interaction.user.id }) || new User({ userId: interaction.user.id });
    const music = new EmbedBuilder()
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setColor(accent);

    const premrow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setLabel('Premium').setStyle('Link').setURL(client.config.links.dc),
        new ButtonBuilder().setLabel('Vote').setStyle('Link')
          .setEmoji('<:vote:985926662552178748>')
          .setURL(`https://top.gg/bot/${client.user.id}/vote`)
      );

    const command = client.slash.get(interaction.commandName);
    if (!command) return interaction.reply({ content: 'An error occurred — please contact support.' });

    if (command.cooldown && slash(interaction, command)) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setDescription(`<:11:1052589045374533653> Please wait \`${slash(interaction, command).toFixed(1)}s\` before using \`${command.name}\` again!`)
            .setColor(accent)
        ],
      });
    }

    if (command.userPerms) {
      if (!interaction.member.permissions.has(PermissionsBitField.resolve(command.userPerms || []))) {
        return interaction.reply({ content: `${interaction.member} You need \`${command.userPerms}\` permissions to use this command`, ephemeral: true });
      }
    }

    if (command.botPerms) {
      if (!interaction.guild.members.cache.get(client.user.id).permissions.has(PermissionsBitField.resolve(command.botPerms || []))) {
        return interaction.reply({ content: `I don't have the \`${command.botPerms}\` permissions to run this command`, ephemeral: true });
      }
    }

    if (command.owner) {
      if (client.config.owner) {
        const devs = client.config.owner.find(x => x === interaction.user.id);
        if (!devs) return interaction.reply({ embeds: [music.setDescription('Only My Owners can use this command!')], ephemeral: true });
      }
    }

    if (user.blacklisted) {
      return interaction.reply({
        embeds: [new EmbedBuilder().setColor(accent).setDescription('You are Blacklisted from using this bot.\nYou can appeal at our Support Server.')],
        ephemeral: true,
      });
    }

    try {
      command.run(client, interaction);
      user.ccount++;
      await user.save();
    } catch (e) {
      interaction.reply({ content: 'An error occurred while running this command.', ephemeral: true });
    }
  }
};
