const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'loop',
  description: 'Set loop mode: off / song / queue',
  category: 'music',
  aliases: ['lp', 'repeat'],
  cooldown: 2,

  run: async (client, message, args) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue) return message.reply({ content: '❌ Nothing is playing right now!' });

    const modeMap = { off: 0, song: 1, queue: 2 };
    let mode;

    if (args[0] && modeMap[args[0].toLowerCase()] !== undefined) {
      mode = modeMap[args[0].toLowerCase()];
    } else {
      mode = (queue.repeatMode + 1) % 3;
    }

    client.distube.setRepeatMode(message.guild.id, mode);

    const labels = { 0: '🚫 Loop Off', 1: '🔂 Loop Song', 2: '🔁 Loop Queue' };

    const container = new Container()
      .setAccentColor(0xFFFFFF)
      .addComponents(
        new TextDisplay(`## ${labels[mode]}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`Loop mode set to **${labels[mode]}**`)
      );

    message.reply({ flags: IS_COMPONENTS_V2, components: [container.toJSON()] });
  },
};
