const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'afk',
  aliases: ['away'],
  cooldown: 10,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Set your AFK status with an optional message',
  usage: ['afk', 'afk <reason>'],
  run: async (client, message, args) => {
    const reason = args.join(' ') || 'AFK';
    const key    = `afk_${message.author.id}`;

    await client.db.set(key, { reason, since: Date.now() });

    const container = new Container()
      .setAccentColor('#FFFFFF')
      .addComponents(
        new TextDisplay(`## 💤 AFK Set`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `<@${message.author.id}> I've set your AFK status.\n\n` +
          `➜ **Reason:** ${reason}`
        )
      );
    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
