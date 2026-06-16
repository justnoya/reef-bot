const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "serverinfo",
  category: "info",
  aliases: ['si'],
  cooldown: 5,
  botPerms: ['ViewChannel', 'EmbedLinks'],
  userPerms: ['ViewChannel'],
  description: "Detailed information about this server",
  run: async (client, message) => {
    const accent = '#FFFFFF';
    const guild = message.guild;
    try { await guild.members.fetch(); } catch (_) {}

    const channels = guild.channels.cache;
    const members  = guild.members.cache;
    const emojis   = guild.emojis.cache;
    const verLevels  = ['None', 'Low', 'Medium', 'High', 'Very High'];
    const boostTiers = ['No Level', 'Level 1', 'Level 2', 'Level 3'];
    const iconURL  = guild.iconURL({ extension: 'png', size: 1024 }) || client.user.displayAvatarURL();

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## ${guild.name}`),
            new TextDisplay(`ID: \`${guild.id}\``)
          )
          .setAccessory(new Thumbnail().setURL(iconURL)),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `**About**\n` +
          `➜ Owner: <@${guild.ownerId}>\n` +
          `➜ Created: <t:${Math.round(guild.createdTimestamp / 1000)}:R>\n` +
          `➜ Verification: \`${verLevels[guild.verificationLevel] || 'Unknown'}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Members**\n` +
          `➜ Total: \`${guild.memberCount}\`\n` +
          `➜ Humans: \`${members.filter(m => !m.user.bot).size}\`\n` +
          `➜ Bots: \`${members.filter(m => m.user.bot).size}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Channels**\n` +
          `➜ Text: \`${channels.filter(c => c.type === 0).size}\`\n` +
          `➜ Voice: \`${channels.filter(c => c.type === 2).size}\`\n` +
          `➜ Forums: \`${channels.filter(c => c.type === 15).size}\`\n` +
          `➜ Total: \`${channels.size}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Boosts**\n` +
          `➜ Tier: \`${boostTiers[guild.premiumTier] || 'No Level'}\`\n` +
          `➜ Boosts: \`${guild.premiumSubscriptionCount || 0}\`\n\n` +
          `**Emojis:** \`${emojis.size}\` (${emojis.filter(e => e.animated).size} animated)`
        ),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`*Highest Role: <@&${guild.roles.highest.id}>*`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
