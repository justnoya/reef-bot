const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "userinfo",
  aliases: ['ui', 'whois'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: "Detailed information about a user",
  usage: ['userinfo', 'userinfo @user'],
  run: async (client, message, args) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const user   = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    const member = message.guild.members.cache.get(user.id);

    const roles = member?.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `<@&${r.id}>`)
      .slice(0, 10)
      .join(' ') || '`None`';

    const joinedAt  = member ? `<t:${Math.round(member.joinedTimestamp / 1000)}:R>` : '`Unknown`';
    const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}:R>`;
    const boost     = member?.premiumSince
      ? `<t:${Math.round(member.premiumSinceTimestamp / 1000)}:R>` : '`Not Boosting`';

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## ${user.username}`),
            new TextDisplay(`<@${user.id}> • \`${user.id}\``)
          )
          .setAccessory(new Thumbnail().setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `**Account**\n` +
          `➜ Created: ${createdAt}\n` +
          `➜ Bot: \`${user.bot ? 'Yes' : 'No'}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Member**\n` +
          `➜ Joined: ${joinedAt}\n` +
          `➜ Nickname: \`${member?.nickname || 'None'}\`\n` +
          `➜ Boosting Since: ${boost}`
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(`**Roles [${(member?.roles.cache.size || 1) - 1}]**\n${roles}`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
