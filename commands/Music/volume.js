const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'volume',
  description: 'Set the music volume (1–100)',
  category: 'music',
  aliases: ['vol'],
  cooldown: 2,
  args: true,

  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue) return message.reply({ content: '❌ Nothing is playing right now!' });

    const vol = parseInt(args[0], 10);
    if (isNaN(vol) || vol < 1 || vol > 100) {
      return message.reply({ content: '❌ Please provide a volume between `1` and `100`.' });
    }

    client.distube.setVolume(message.guild.id, vol);

    const bar  = '█'.repeat(Math.round(vol / 10)) + '░'.repeat(10 - Math.round(vol / 10));
    const container = new Container()
      .setAccentColor(0xFFFFFF)
      .addComponents(
        new TextDisplay(`## 🔊 Volume`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`\`${bar}\` **${vol}%**`)
      );

    message.reply({ flags: IS_COMPONENTS_V2, components: [container.toJSON()] });
  },
};
