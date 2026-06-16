const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'botlist',
  aliases: ['bots', 'listbots'],
  cooldown: 10,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'List all bots in the server',
  usage: ['botlist'],
  run: async (client, message) => {
    const accent = '#FFFFFF';
    await message.guild.members.fetch();

    const bots = message.guild.members.cache
      .filter(m => m.user.bot)
      .sort((a, b) => a.user.username.localeCompare(b.user.username))
      .map(m => `➜ \`${m.user.username}\` — \`${m.user.id}\``)
      .join('\n');

    const botCount = message.guild.members.cache.filter(m => m.user.bot).size;

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## 🤖 Bots in ${message.guild.name}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`**Total Bots:** \`${botCount}\``),
        new Separator().setSpacing('Small'),
        new TextDisplay(bots || '*No bots found.*')
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
