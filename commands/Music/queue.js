'use strict';

const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');
const { formatMs } = require('../../util/musicPlayerUI');

module.exports = {
  name: 'queue',
  description: 'Show the current music queue',
  category: 'music',
  aliases: ['q'],
  cooldown: 3,

  run: async (client, message) => {
    const player = client.lavalink?.getPlayer(message.guild.id);
    if (!player?.queue?.current)
      return message.reply({ content: '❌ The queue is empty!' });

    const current  = player.queue.current;
    const upcoming = player.queue.tracks.slice(0, 10);

    const currentLine = `**Now Playing:**\n🎵 \`${current.info.title}\` · \`${formatMs(current.info.duration)}\``;

    const upcomingLines = upcoming.length
      ? upcoming.map((t, i) =>
          `\`${String(i + 1).padStart(2, '0')}\` **${t.info.title}** · \`${formatMs(t.info.duration)}\``
        ).join('\n')
      : '*No more songs in queue.*';

    const total   = player.queue.tracks.length + 1;
    const loopMap = { off: '🚫 Off', track: '🔂 Song', queue: '🔁 Queue' };
    const footer  = `**${total}** song${total !== 1 ? 's' : ''} in queue · Loop: **${loopMap[player.repeatMode] || 'Off'}** · Volume: **${player.volume}%**`;

    const container = new Container()
      .setAccentColor(0xFFFFFF)
      .addComponents(
        new TextDisplay(`## 🎵 Music Queue`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(currentLine),
        new Separator().setSpacing('Small'),
        new TextDisplay(`**Up Next:**\n${upcomingLines}`),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(footer)
      );

    message.reply({ flags: IS_COMPONENTS_V2, components: [container.toJSON()] });
  },
};
