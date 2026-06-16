const { MessageFlags } = require('discord.js');

const IS_COMPONENTS_V2 = MessageFlags.IsComponentsV2;

function buildPlayerContainer(song, accentColor, paused = false) {
  const color = typeof accentColor === 'number'
    ? accentColor
    : (typeof accentColor === 'string' ? parseInt(accentColor.replace('#', ''), 16) : 0xFFFFFF);

  const title     = song.name      || song.title    || 'Unknown Title';
  const artist    = song.uploader?.name || song.channel || 'Unknown Artist';
  const duration  = song.formattedDuration || song.duration || '0:00';
  const thumbnail = song.thumbnail || 'https://i.imgur.com/8ZvgWsD.png';

  return {
    type: 17,
    accent_color: color,
    components: [
      { type: 10, content: `**🎵 Now Playing**` },
      {
        type: 12,
        items: [{ media: { url: thumbnail } }],
      },
      {
        type: 10,
        content: `# ${title}\n> \`${artist}\`\n> \`${duration}\`\n\n`,
      },
      { type: 14, divider: true, spacing: 1 },
      {
        type: 1,
        components: [
          { type: 2, style: 2, label: '⏮',              custom_id: 'music_prev'  },
          { type: 2, style: paused ? 1 : 2, label: paused ? '▶' : '⏸', custom_id: 'music_pause' },
          { type: 2, style: 2, label: '⏭',              custom_id: 'music_skip'  },
          { type: 2, style: 4, label: '⏹',              custom_id: 'music_stop'  },
        ],
      },
      {
        type: 1,
        components: [
          {
            type: 3,
            custom_id: 'music_options',
            placeholder: 'Player Options',
            options: [
              { label: 'Loop Song',    value: 'loop_song',      emoji: { name: '🔂' } },
              { label: 'Loop Queue',   value: 'loop_queue',     emoji: { name: '🔁' } },
              { label: 'Shuffle',      value: 'smart_shuffle',  emoji: { name: '🔀' } },
              { label: 'Add to Queue', value: 'add_songs',      emoji: { name: '➕' } },
              { label: 'Stop',         value: 'stop',           emoji: { name: '⏹' } },
            ],
          },
        ],
      },
    ],
  };
}

module.exports = { buildPlayerContainer, IS_COMPONENTS_V2 };
