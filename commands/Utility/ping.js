const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "ping",
  aliases: ['ping'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  usage: ['ping'],
  description: "Shows the bot's latency",
  run: async (client, message) => {
    const accent = '#FFFFFF';

    const before = Date.now();
    const tmp = await message.channel.send({ content: '\u200b' });
    const rest = Date.now() - before;
    await tmp.delete().catch(() => {});

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## Ping`),
            new TextDisplay(`Latency results`)
          )
          .setAccessory(new Thumbnail().setURL(client.user.displayAvatarURL())),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **Gateway:** \`${client.ws.ping}ms\`\n` +
          `➜ **REST:** \`${rest}ms\``
        )
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
