const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "warn",
  aliases: ['w'],
  cooldown: 5,
  category: 'mod',
  botPerms: ['ViewChannel'],
  userPerms: ['ModerateMembers'],
  description: "Warn a member and log the reason",
  usage: ['warn @user [reason]'],
  args: true,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';

    const target = message.mentions.users.first() || client.users.cache.get(args[0]);
    if (!target) return message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay('❌ Please mention a member to warn.')).toJSON()],
      flags: IS_COMPONENTS_V2
    });
    if (target.id === message.author.id) return message.channel.send({
      components: [new Container().setAccentColor('#ff0000').addComponents(new TextDisplay('❌ You cannot warn yourself.')).toJSON()],
      flags: IS_COMPONENTS_V2
    });

    const reason   = args.slice(1).join(' ') || 'No reason provided';
    const warnKey  = `warns_${message.guild.id}_${target.id}`;
    const warns    = await client.db.get(warnKey) || [];
    warns.push({ reason, mod: message.author.id, time: Date.now() });
    await client.db.set(warnKey, warns);

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:40:1052589138819436624> Warning Issued`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **User:** <@${target.id}>\n` +
          `➜ **Reason:** ${reason}\n` +
          `➜ **Total Warns:** \`${warns.length}\`\n` +
          `➜ **Moderator:** <@${message.author.id}>`
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    try { await target.send({ content: `⚠️ You have been warned in **${message.guild.name}**\nReason: ${reason}` }); } catch (_) {}
  }
};
