const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField } = require('discord.js');
const { buildCategoryContainer, buildMainContainer, IS_COMPONENTS_V2 } = require('../util/helpBuilder');

const User  = require("../Models/User");
const { slash } = require(`${process.cwd()}/util/onCoolDown.js`);

module.exports.run = async (client, interaction) => {
  let prefix = await client.db.get(`prefix_${interaction.guild?.id}`);
  if (prefix === null) prefix = client.prefix;

  const accent = interaction.guild?.members?.me?.displayHexColor !== '#000000'
    ? interaction.guild?.members?.me?.displayHexColor
    : client.config.embedColor;

  // ── Help: select menu ────────────────────────────────────────────────────────
  if (interaction.isStringSelectMenu?.() || interaction.isSelectMenu?.()) {
    if (interaction.customId === 'helpop') {
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

  // ── Help: navigation buttons ─────────────────────────────────────────────────
  if (interaction.isButton()) {
    // Back → show main menu
    if (interaction.customId === 'helpback') {
      const inviteURL  = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=applications.commands%20bot`;
      const supportURL = client.config.links.dc;
      const container  = buildMainContainer(client, prefix, accent, inviteURL, supportURL);
      return interaction.update({
        components: [container.toJSON()],
        flags: IS_COMPONENTS_V2,
      }).catch(() => {});
    }

    // Previous / Next → helpcat_<category>_<page>
    if (interaction.customId.startsWith('helpcat_')) {
      const parts    = interaction.customId.split('_');
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

    // Disabled no-op buttons — just ack silently
    if (interaction.customId.startsWith('help_noop')) {
      return interaction.deferUpdate().catch(() => {});
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
