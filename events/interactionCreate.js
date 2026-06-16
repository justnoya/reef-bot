const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const { buildCategoryContainer, buildMainContainer, IS_COMPONENTS_V2 } = require('../util/helpBuilder');
const { buildPlayerContainer } = require('../util/musicPlayerUI');

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

  const accent = '#FFFFFF';

  // ── Help: select menu ────────────────────────────────────────────────────────
  if (interaction.isStringSelectMenu?.() || interaction.isSelectMenu?.()) {
    const customId = interaction.customId;

    // ── Music: player options select ─────────────────────────────────────────
    if (customId === 'music_options') {
      const value = interaction.values[0];
      const q = client.distube.getQueue(interaction.guild.id);

      await interaction.deferUpdate();

      if (value === 'stop') {
        try { await client.distube.stop(interaction.guild.id); } catch (_) {}
        return interaction.editReply({ content: '⏹ Stopped and disconnected.', components: [], flags: 0 }).catch(() => {});
      }

      if (!q) {
        return interaction.followUp({ content: '❌ Nothing is playing right now.', ephemeral: true }).catch(() => {});
      }

      let reply = '';
      if (value === 'loop_queue') {
        const mode = q.repeatMode === 2 ? 0 : 2;
        client.distube.setRepeatMode(interaction.guild.id, mode);
        reply = `🔁 Loop Queue **${mode === 2 ? 'ON' : 'OFF'}**`;
      }
      if (value === 'loop_song') {
        const mode = q.repeatMode === 1 ? 0 : 1;
        client.distube.setRepeatMode(interaction.guild.id, mode);
        reply = `🔂 Loop Song **${mode === 1 ? 'ON' : 'OFF'}**`;
      }
      if (value === 'smart_shuffle') {
        try { await client.distube.shuffle(interaction.guild.id); } catch (_) {}
        reply = '🔀 Queue shuffled!';
      }
      if (value === 'add_songs') { reply = `➕ Use \`${prefix}play <song>\` to add more songs to the queue!`; }

      if (reply) interaction.followUp({ content: reply, ephemeral: true }).catch(() => {});

      if (q?.songs?.length) {
        const updatedContainer = buildPlayerContainer(q.songs[0], 0xFFFFFF, q.paused);
        interaction.editReply({ flags: IS_COMPONENTS_V2, components: [updatedContainer] }).catch(() => {});
      }
      return;
    }

    // ── Setup: role dropdown ─────────────────────────────────────────────────
    if (customId === 'setup_role') {
      const { buildSetupContainer } = require('../commands/Setup/setup');
      const selected = interaction.values[0];

      if (selected === 'owner' && interaction.guild.ownerId !== interaction.user.id) {
        return interaction.reply({
          content: '❌ Only the **server owner** can select the *Owner* role.',
          ephemeral: true,
        }).catch(() => {});
      }

      const container = buildSetupContainer(interaction.guild, selected, false);
      return interaction.update({
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2,
      }).catch(() => {});
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
      const q = client.distube.getQueue(interaction.guild.id);

      if (!q || !q.songs?.length) {
        return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
      }

      await interaction.deferUpdate();

      if (customId === 'music_prev') {
        try {
          await client.distube.previous(interaction.guild.id);
        } catch {
          interaction.followUp({ content: '⏮ No previous song.', ephemeral: true }).catch(() => {});
        }
        return;
      }

      if (customId === 'music_pause') {
        const willBePaused = !q.paused;
        if (q.paused) client.distube.resume(interaction.guild.id);
        else          client.distube.pause(interaction.guild.id);
        const updatedContainer = buildPlayerContainer(q.songs[0], 0xFFFFFF, willBePaused);
        return interaction.editReply({ flags: IS_COMPONENTS_V2, components: [updatedContainer] }).catch(() => {});
      }

      if (customId === 'music_skip') {
        try {
          await client.distube.skip(interaction.guild.id);
          interaction.followUp({ content: '⏭ Skipped!', ephemeral: true }).catch(() => {});
        } catch {
          interaction.followUp({ content: '❌ No next song in queue.', ephemeral: true }).catch(() => {});
        }
        return;
      }

      if (customId === 'music_stop') {
        try { await client.distube.stop(interaction.guild.id); } catch (_) {}
        return interaction.editReply({ content: '⏹ Stopped and disconnected.', components: [], flags: 0 }).catch(() => {});
      }

      return;
    }

    // ── Setup: accept terms ───────────────────────────────────────────────────
    if (customId.startsWith('setup_terms_')) {
      const { buildSetupContainer } = require('../commands/Setup/setup');
      const role = customId.replace('setup_terms_', '');
      if (role === 'none') return interaction.deferUpdate().catch(() => {});

      const container = buildSetupContainer(interaction.guild, role, true);
      return interaction.update({
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2,
      }).catch(() => {});
    }

    // ── Setup: confirm ────────────────────────────────────────────────────────
    if (customId.startsWith('setup_confirm_')) {
      const { buildSetupContainer } = require('../commands/Setup/setup');
      const role = customId.replace('setup_confirm_', '');
      if (role === 'none') return interaction.deferUpdate().catch(() => {});

      await interaction.deferUpdate().catch(() => {});

      await client.db.set(`setup_guild_${interaction.guild.id}`, {
        guildId:   interaction.guild.id,
        guildName: interaction.guild.name,
        ownerId:   interaction.guild.ownerId,
        setupBy:   interaction.user.id,
        setupRole: role,
        setupAt:   Date.now(),
      });

      const { Container, TextDisplay, Separator } = require('../V2components');
      const success = new Container()
        .setAccentColor('#00c26f')
        .addComponents(
          new TextDisplay('## ✅ Setup Complete!'),
          new Separator().setDivider(true).setSpacing('Small'),
          new TextDisplay(`**${interaction.guild.name}** has been successfully configured.`),
          new TextDisplay(`-# Role: **${role === 'owner' ? 'Owner' : 'Other'}** · Set up by <@${interaction.user.id}>`)
        );

      return interaction.editReply({
        components: [success.toJSON()],
        flags: IS_COMPONENTS_V2,
      }).catch(() => {});
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

    // ── Cybork Turbo gift: Claim ──────────────────────────────────────────────
    if (customId === 'cybork_turbo_claim') {
      const { buildGiftCard, buildGiftFiles, IS_COMPONENTS_V2: CV2 } = require('../commands/Owner/turbogift');
      const claimed = buildGiftCard(null, true, interaction.user.id);
      return interaction.update({
        components: [claimed.toJSON()],
        files: buildGiftFiles(),
        flags: CV2,
      }).catch(() => {});
    }

    if (customId === 'cybork_turbo_noop') {
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
