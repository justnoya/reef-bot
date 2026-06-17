'use strict';

const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'loop',
  description: 'Set loop mode: off / song / queue',
  category: 'music',
  aliases: ['lp', 'repeat'],
  cooldown: 2,

  run: async (client, message, args) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player) return message.reply({ content: '❌ Nothing is playing right now!' });

    const modes   = ['off', 'track', 'queue'];
    const aliases = { song: 'track', queue: 'queue', off: 'off' };

    let mode;
    if (args[0] && aliases[args[0].toLowerCase()] !== undefined) {
      mode = aliases[args[0].toLowerCase()];
    } else {
      const idx = modes.indexOf(player.repeatMode);
      mode = modes[(idx + 1) % modes.length];
    }

    await player.setRepeatMode(mode);

    const labels = { off: '🚫 Loop Off', track: '🔂 Loop Song', queue: '🔁 Loop Queue' };

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
