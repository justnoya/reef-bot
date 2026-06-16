const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "warnings",
  aliases: ['warns', 'warnlist'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ViewChannel'],
  userPerms: ['ModerateMembers'],
  description: "View all warnings for a member",
  usage: ['warnings @user'],
  run: async (client, message, args) => {
    const accent = message.guild.members.me.displayHexColor !== '#000000'
      ? message.guild.members.me.displayHexColor : client.config.embedColor;

    const target = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    const warns  = await client.db.get(`warns_${message.guild.id}_${target.id}`) || [];

    if (!warns.length) {
      const container = new Container()
        .setAccentColor(accent)
        .addComponents(new TextDisplay(`✅ **${target.username}** has no warnings in this server.`));
      return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const warnList = warns.slice(-10).reverse()
      .map((w, i) => `**${i + 1}.** ${w.reason} — by <@${w.mod}> <t:${Math.round(w.time / 1000)}:R>`)
      .join('\n');

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## Warnings — ${target.username}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`**Total:** \`${warns.length}\`\n\n${warnList}`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
