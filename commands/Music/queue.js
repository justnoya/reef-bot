const { Container, TextDisplay, Separator, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: 'queue',
  description: 'Show the current music queue',
  category: 'music',
  aliases: ['q'],
  cooldown: 3,

  run: async (client, message) => {
    const queue = client.distube.getQueue(message.guild.id);
    if (!queue || !queue.songs.length) {
      return message.reply({ content: '❌ The queue is empty!' });
    }

    const current = queue.songs[0];
    const upcoming = queue.songs.slice(1, 11);

    const currentLine = `**Now Playing:**\n🎵 \`${current.name}\` · \`${current.formattedDuration || current.duration || '?'}\``;

    const upcomingLines = upcoming.length
      ? upcoming.map((s, i) =>
          `\`${String(i + 1).padStart(2, '0')}\` **${s.name}** · \`${s.formattedDuration || s.duration || '?'}\``
        ).join('\n')
      : '*No more songs in queue.*';

    const total   = queue.songs.length;
    const loopMap = { 0: 'Off', 1: '🔂 Song', 2: '🔁 Queue' };
    const footer  = `**${total}** song${total !== 1 ? 's' : ''} in queue · Loop: **${loopMap[queue.repeatMode] || 'Off'}** · Volume: **${queue.volume}%**`;

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
