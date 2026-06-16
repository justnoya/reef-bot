const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'snipe',
  aliases: ['sn', 's2'],
  cooldown: 5,
  category: 'utility',
  botPerms: ['ViewChannel'],
  userPerms: ['ViewChannel'],
  description: 'Show the last deleted message in this channel',
  usage: ['snipe'],
  run: async (client, message) => {
    const accent = '#FFFFFF';

    if (!client.snipes) client.snipes = new Map();
    const snipe = client.snipes.get(message.channel.id);

    if (!snipe) {
      const container = new Container()
        .setAccentColor('#ff0000')
        .addComponents(new TextDisplay('<:error:1425509196773720177> No recently deleted messages found in this channel.'));
      return message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const ts = Math.round(snipe.time / 1000);
    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## 👻 Sniped Message`),
            new TextDisplay(`<@${snipe.authorId}> • <t:${ts}:R>`)
          )
          .setAccessory(new Thumbnail().setURL(snipe.avatarURL)),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(snipe.content || '*[No text content — may have had attachments]*')
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
