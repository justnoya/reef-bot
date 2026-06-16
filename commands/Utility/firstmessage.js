const { Container, TextDisplay, Separator, ActionRow, Button, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'firstmessage',
  aliases: ['fm', 'firstmsg'],
  cooldown: 10,
  category: 'utility',
  botPerms: ['ViewChannel', 'ReadMessageHistory'],
  userPerms: ['ViewChannel'],
  description: 'Get a link to the first message ever sent in a channel',
  usage: ['firstmessage', 'firstmessage #channel'],
  run: async (client, message, args) => {
    const accent  = '#FFFFFF';
    const channel = message.mentions.channels.first()
      || message.guild.channels.cache.get(args[0])
      || message.channel;

    const msgs = await channel.messages.fetch({ limit: 1, after: '0' });
    const first = msgs.first();

    if (!first) {
      const c = new Container().setAccentColor('#ff0000')
        .addComponents(new TextDisplay('<:error:1425509196773720177> Could not find the first message in that channel.'));
      return message.channel.send({ components: [c.toJSON()], flags: IS_COMPONENTS_V2 });
    }

    const ts = `<t:${Math.round(first.createdTimestamp / 1000)}:F>`;
    const jumpRow = new ActionRow().addComponents(
      new Button().setLabel('Jump to Message').setURL(first.url)
    );

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new TextDisplay(`## <:utility:1516337285925179422> First Message — #${channel.name}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(
          `➜ **Author:** <@${first.author.id}>\n` +
          `➜ **Sent:** ${ts}\n` +
          `➜ **Content:** ${first.content ? first.content.slice(0, 200) : '*[No text content]*'}`
        ),
        new Separator().setDivider(true).setSpacing('Small'),
        jumpRow
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
