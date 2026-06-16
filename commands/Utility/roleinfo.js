const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "roleinfo",
  aliases: ['ri'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: "Information about a role",
  usage: ['roleinfo @role'],
  run: async (client, message, args) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
    if (!role) {
      const container = new Container()
        .setAccentColor('#ff0000')
        .addComponents(new TextDisplay('❌ Please mention a role or provide a role ID.'));
      return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const members   = message.guild.members.cache.filter(m => m.roles.cache.has(role.id));
    const keyPerms  = role.permissions.toArray().slice(0, 8).map(p => `\`${p}\``).join('  ') || '`None`';
    const roleColor = (role.hexColor && role.hexColor !== '#000000') ? role.hexColor : accent;

    const container = new Container()
      .setAccentColor(roleColor)
      .addComponents(
        new TextDisplay(`## ${role.name}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **ID:** \`${role.id}\`\n` +
          `➜ **Color:** \`${role.hexColor}\`\n` +
          `➜ **Position:** \`${role.position}\`\n` +
          `➜ **Members:** \`${members.size}\`\n` +
          `➜ **Mentionable:** \`${role.mentionable ? 'Yes' : 'No'}\`\n` +
          `➜ **Hoisted:** \`${role.hoist ? 'Yes' : 'No'}\`\n` +
          `➜ **Managed:** \`${role.managed ? 'Yes' : 'No'}\`\n` +
          `➜ **Created:** <t:${Math.round(role.createdTimestamp / 1000)}:R>`
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(`**Key Permissions**\n${keyPerms}`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
