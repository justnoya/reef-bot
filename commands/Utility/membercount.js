const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'membercount',
  aliases: ['mc', 'members'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Shows a detailed member count breakdown for the server',
  usage: ['membercount'],
  run: async (client, message) => {
    const accent = '#FFFFFF';
    await message.guild.members.fetch();

    const all     = message.guild.memberCount;
    const humans  = message.guild.members.cache.filter(m => !m.user.bot).size;
    const bots    = message.guild.members.cache.filter(m => m.user.bot).size;
    const online  = message.guild.members.cache.filter(m => m.presence?.status === 'online').size;
    const idle    = message.guild.members.cache.filter(m => m.presence?.status === 'idle').size;
    const dnd     = message.guild.members.cache.filter(m => m.presence?.status === 'dnd').size;
    const offline = all - online - idle - dnd;

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:utility:1516337285925179422> Member Count — ${message.guild.name}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `**Total:** \`${all}\`\n` +
          `➜ 👤 Humans: \`${humans}\`\n` +
          `➜ 🤖 Bots: \`${bots}\``
        ),
        new Separator().setSpacing('Small'),
        new TextDisplay(
          `**Presence**\n` +
          `➜ 🟢 Online: \`${online}\`\n` +
          `➜ 🟡 Idle: \`${idle}\`\n` +
          `➜ 🔴 Do Not Disturb: \`${dnd}\`\n` +
          `➜ ⚫ Offline: \`${offline}\``
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
